# Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed-FP16

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Speed-FP16 es un empaquetado de inferencia del modelo Qwen/Qwen3.8-27B, desarrollado por el autor Youssofal para el runtime propietario MTPLX. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión: mantiene los pesos cuantizados a 4 bits dinámicos byte a byte idénticos al pack padre (Optimized Speed) y convierte a fp16 los tensores que permanecen en coma flotante (escalas, sesgos, normas, parámetros de convolución y estado del GDN, y la cabeza MTP), en lugar de bf16. El objetivo es hacer viable el modelo en Apple Silicon de primera y segunda generación (M1 y M2), que no ejecutan bf16 con buen rendimiento.

El modelo base tiene 27.356.723.952 parámetros (27,36 mil millones) y una ventana de contexto de 262.144 tokens. La innovación principal del pack es el uso de decodificación especulativa nativa mediante multi-token prediction (MTP) con profundidad 3, que según el autor multiplica por dos o tres la velocidad de la decodificación simple y es exacta a cualquier temperatura. El repositorio ocupa 21,6 GB y la descarga declarada es de 20,4 GB.

Es relevante ahora porque permite ejecutar un modelo de 27B con contexto largo en portátiles y equipos de sobremesa de Apple con 32 GB o más de memoria unificada, un segmento donde las alternativas suelen limitarse a modelos mucho más pequeños o a cuantizaciones de menor calidad. El pack está pensado explícitamente para tareas de código, con etiquetas que mencionan opencode y claude-code.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8); empaquetado para runtime MTPLX con decodificación especulativa MTP. La model card menciona parámetros de convolución y estado del GDN, lo que sugiere componentes de atención lineal o híbrida, sin detalle adicional disponible |
| Parámetros totales | 27.356.723.952 (27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Pesos a 4 bits dinámicos; tensores flotantes restantes en fp16 (el pack padre equivalente usa bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx, orientada a MLX en Apple Silicon) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, del que no se proporcionan en la información disponible detalles sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de empaquetado: se parte del checkpoint bf16 de Qwen3.8-27B y se aplica una cuantización dinámica a 4 bits para la mayoría de los pesos, mientras que los tensores que no se cuantizan (escalas, sesgos, normas, la convolución y los parámetros de estado del GDN, y la cabeza MTP) se almacenan en fp16. El repositorio incluye un manifiesto, `MTPLX_FP16_CONVERSION_MANIFEST.json`, que lista cada tensor convertido y cada tensor preservado, con su sha256 por shard.

La innovación técnica central es la decodificación especulativa por predicción multi-token con profundidad 3, implementada de forma nativa en el runtime MTPLX. Los borradores se aceptan mediante la regla de ratio de probabilidades más remuestreo residual, lo que hace que la especulación sea exacta a cualquier temperatura: el autor reporta que mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta simple dentro del ruido propio de esta última, con temperatura 1, top-p 0,95 y top-k 20. La calidad del pack frente al checkpoint bf16, medida con teacher forcing sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe, es del 96,0 % de acuerdo top-1 con KL 0,012 para esta variante de 4 bits dinámicos (la variante de 8 bits alcanza 99,3 % y KL 0,0005).

## Capacidades

- Generación de texto y conversación multi-turno con ventana de 262.144 tokens.
- Generación de código: el pack está etiquetado y optimizado para tareas de programación, con mención explícita a flujos tipo opencode y claude-code.
- Razonamiento extendido: el autor reporta mediciones en «long xhigh reasoning», lo que indica soporte de modos de razonamiento de alta profundidad heredados del modelo base.
- Decodificación especulativa exacta a cualquier temperatura, integrada en el runtime.
- Capacidades multilingües: no disponibles en detalle; solo se menciona un «aviso multilingüe» en el conjunto de evaluación de calidad.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Asistencia de programación local en Mac: el pack está pensado para integrarse en editores y agentes de código (opencode, claude-code) sobre un MacBook Pro o Mac Studio, con 20,4 GB de descarga y un pico de memoria unificado de 23,6 GB medido en el pack padre, lo que lo hace viable en equipos de 32 GB.
- Refactorización y reescritura de ficheros: el autor mide 87,6 tok/s reescribiendo un fichero que el modelo acababa de generar, un escenario típico de edición iterativa de código donde la velocidad de decodificación condiciona la experiencia.
- Análisis de repositorios completos: con 262.144 tokens de contexto se pueden cargar varios ficheros o un módulo entero y hacer preguntas transversales sin trocear el código en fragmentos que pierdan dependencias.
- Razonamiento largo en local: los 35,1 a 37,3 tok/s reportados en razonamiento xhigh permiten usar el modelo para problemas de varios pasos sin depender de la nube, útil cuando hay requisitos de confidencialidad del código.
- Generación de documentación y pruebas: la ventana larga y el soporte de JSON en la evaluación de calidad lo hacen adecuado para producir documentación estructurada o casos de prueba a partir de especificaciones extensas.
- Prototipado offline en portátil: al ejecutarse íntegramente en Apple Silicon con MTPLX, sirve para trabajar sin conexión en entornos con restricciones de red o de cumplimiento de datos.
- Evaluación comparativa de cuantizaciones: el manifiesto con sha256 por shard y las métricas de acuerdo top-1 y KL permiten reproducir la comparación entre el pack de 4 bits y el checkpoint bf16 en un pipeline de validación propio.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en MTPLX 2.11.3 (16 de septiembre de 2026) sobre un MacBook Pro M5 Max con ventiladores al máximo y muestreo con los ajustes oficiales de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20). No se han publicado cifras específicas para M1 ni M2.

| Prueba | tok/s |
|---|---|
| Optimized Speed reescribiendo un fichero recién generado, ajustes de stock (MTPLX 2.10.0) | 87,6 |
| Bare Speed en una tarea de código nueva con muestreo oficial (MTPLX 2.7.0) | 65,2 |
| Optimized Speed en una respuesta de chat de 3k tokens (MTPLX 2.10.0) | 64,3 |
| Récord de 27B en generación nueva: Qwen 3.6 27B Optimized Speed, bench de 192 tokens, 2 de julio de 2026 | 81,74 |

| Métrica de calidad frente al checkpoint bf16 de Qwen3.8-27B | Valor |
|---|---|
| Posiciones evaluadas (teacher forcing: código, prosa, JSON, aviso multilingüe) | 2.389 |
| Acuerdo top-1, Optimized Speed (4 bits dinámicos) | 96,0 % |
| KL, Optimized Speed (4 bits dinámicos) | 0,012 |
| Acuerdo top-1, Optimized Quality (8 bits dinámicos) | 99,3 % |
| KL, Optimized Quality (8 bits dinámicos) | 0,0005 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada mínima: 32 GB para este pack (36 GB para la variante Optimized Quality de 8 bits).
- Pico de memoria unificado medido: 23,6 GB (cifra del pack padre, medida en M5 Max).
- Descarga: 20,4 GB; tamaño del repositorio en Hugging Face: 21,6 GB.
- Plataformas: Apple Silicon de M1 a M5, en MacBook Pro, MacBook Air, Mac mini y Mac Studio.
- Este build está destinado a M1 y M2; en M3 o superior el autor recomienda el pack padre en bf16. La aplicación MTPLX y el comando `mtplx start` enrutan automáticamente M1/M2 a los builds FP16 y el resto a los padres.
- Despliegue: exclusivamente mediante el runtime MTPLX (aplicación de macOS o `pip install mtplx` y `mtplx serve --model ...`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato no es GGUF.
- Throughput: 58,7 tok/s en tarea de código y 35,1 a 37,3 tok/s en razonamiento xhigh según las cifras del pack padre en M5 Max; no hay cifras publicadas para M1 ni M2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Speed-FP16 (este) | 27,36 B | 262.144 | 4 bits dinámicos + fp16 en tensores flotantes | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized-Speed (pack padre) | 27,36 B | 262.144 | 4 bits dinámicos + bf16 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized-Quality-FP16 | 27,36 B | 262.144 | 8 bits dinámicos + fp16 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen/Qwen3.8-27B (checkpoint original) | 27,36 B | 262.144 | bf16 | Apache 2.0 | Hugging Face |

La comparación con modelos de otros autores no está disponible en la información proporcionada. Las diferencias entre los packs del mismo autor se reducen a la precisión de los tensores flotantes (fp16 frente a bf16) y al nivel de cuantización (4 frente a 8 bits), manteniendo idéntico layout, profundidad de especulación, ajustes de borrador y ventana de contexto.

## Limitaciones y advertencias

- Dependencia total del runtime MTPLX: no hay pesos en GGUF ni compatibilidad documentada con vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue a macOS sobre Apple Silicon.
- El pack está diseñado para M1 y M2; usarlo en M3 o superior no aprovecha la ruta recomendada por el autor.
- La cuantización a 4 bits introduce una divergencia medible frente al bf16: 96,0 % de acuerdo top-1 y KL 0,012 en la evaluación del autor. Para tareas sensibles a la fidelidad exacta conviene la variante de 8 bits.
- No hay cifras de rendimiento publicadas para M1 ni M2; los tok/s citados corresponden a M5 Max y no son extrapolables.
- La model card no documenta sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base.
- No se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe más allá de la mención genérica a un aviso multilingüe en el conjunto de evaluación.
- Licencia Apache 2.0 en el pack y en el modelo base, sin restricciones comerciales adicionales declaradas; conviene verificar los términos del runtime MTPLX, que es software separado y cuya licencia no se detalla en la información disponible.
- El repositorio incluye etiquetas de cuantización a 4 bits y el nombre del pack indica FP16, lo que puede inducir a error: solo los tensores flotantes están en fp16, no los pesos principales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed-FP16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pack padre (bf16): https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Variante Bare Speed FP16: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16
- Variante Optimized Quality FP16: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16
- Sitio de MTPLX: https://mtplx.com
- Benchmarks: https://mtplx.com/benchmarks/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 27B en Mac: https://mtplx.com/models/qwen3.8-27b/
- Comparativa MTPLX vs mlx-serve: https://mtplx.com/compare/mtplx-vs-mlx-serve/
- Comparativa MTPLX vs oMLX: https://mtplx.com/compare/mtplx-vs-omlx/
- Comparativa MTPLX vs LM Studio: https://mtplx.com/compare/mtplx-vs-lm-studio/
- Comparativa MTPLX vs Ollama: https://mtplx.com/compare/mtplx-vs-ollama/
