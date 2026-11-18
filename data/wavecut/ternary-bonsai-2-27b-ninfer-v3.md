# WaveCut/Ternary-Bonsai-2-27B-NInfer-v3

## Resumen

Ternary Bonsai 2 27B NInfer v3 es un artefacto de inferencia empaquetado por WaveCut para el motor NInfer, derivado del modelo Ternary Bonsai 2 27B de PrismML. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada de pesos ternarios (2 bits por valor con una escala fp16 cada 128 columnas) a un formato propietario `.ninfer` que permite ejecutar un transformer de 27B parámetros en GPUs de consumo como la RTX 3090, la RTX 4090 o la RTX 5090.

El modelo base es un transformer de 64 capas con ventana de contexto de 262.144 tokens, torre de visión heredada de Qwen3.8-27B y componentes de decodificación especulativa: una cabeza MTP (Multi-Token Prediction) afinada por ProCreations y un adaptador DFlash2 de z-lab. La contribución principal de esta versión es el empaquetado conjunto de texto, visión, MTP y DFlash2 en un único fichero de 8,87 GiB, junto con una cabeza de propuesta reducida a los 131.072 tokens más frecuentes para acelerar el borrador especulativo.

Es relevante ahora porque demuestra que un modelo multimodal de 27B con contexto de 256K puede servirse en una sola GPU consumer con un consumo de memoria en reposo de entre 12,2 y 15,7 GiB según la cuantización del KV cache y el modo de especulación, algo impensable con pesos en fp16. La licencia Apache 2.0 y la disponibilidad de imagen Docker facilitan su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 64 capas con atención completa, torre de visión y cabeza MTP; pesos ternarios con rotación Hadamard |
| Parametros totales | 27B (aproximado, según nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternario `t2_g128_fp16` (2 bits + escala fp16 por 128 columnas) en proyecciones de texto, cabeza de salida y embeddings; BF16/FP32 en controles GDN, normas, convolución, `A_log` y `dt_bias`; Q8 en cabeza MTP; Q4 en adaptador DFlash2 (proyección QKV fusionada en Q8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (fichero único de 9.520.051.456 bytes, 8,87 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con proyecciones ternarias. La representación `t2_g128_fp16` almacena cada peso en códigos de 2 bits con una escala fp16 compartida por cada 128 columnas, y aplica una rotación Hadamard a las proyecciones para reducir el error de cuantización. Cada proyección conserva el vector de signos de su anchura de entrada, y el motor restaura cada fila de token recolectada con los signos de la anchura oculta. Los controles de la capa GDN (gated delta network), las normas, la convolución, `A_log` y `dt_bias` se mantienen en BF16/FP32, restaurados según las convenciones del exportador de llama.cpp (cabezas de valor agrupadas, `w` en lugar de `1 + w`, `A_log` derivado de `-exp(A_log)`).

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens procesados ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base de PrismML y no se detallan en la información proporcionada. La innovación técnica de este artefacto es el empaquetado: integra en un solo fichero la torre de visión de Qwen3.8-27B, una cabeza MTP afinada sobre características congeladas de Bonsai 2 en Q8, un adaptador DFlash2 en Q4 y una cabeza de propuesta que copia byte a byte las filas ternarias de los 131.072 tokens más frecuentes del ranking de NInfer. Con `--lm-head-draft`, los drafters puntúan candidatos contra esa cabeza reducida en lugar de la completa: MTP decodifica un 4 % más rápido con la misma tasa de aceptación, mientras que DFlash2 no obtiene ganancia medible y desactiva el flag.

## Capacidades

- Generación de texto y razonamiento en ventanas de hasta 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno largas.
- Comprensión de imágenes: pipeline `image-text-to-text` con torre de visión Qwen3.8-27B, activable con `--vision` y residencia en overlay o residente.
- Decodificación especulativa con dos modos: MTP (3 borradores, opcionalmente con `--lm-head-draft`) y DFlash2 (5 borradores por defecto, hasta 7 en respuestas cortas).
- Servidor compatible con las APIs de OpenAI y Anthropic en `/v1`, lo que facilita la integración con clientes existentes.
- Soporte de tool calling y function calling a través del template de chat `qwen3_8.jinja` empaquetado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada sin fragmentación, algo crítico para tareas de resumen y extracción estructurada.
- Asistencia sobre capturas y diagramas: la torre de visión permite consultas image-text-to-text, por ejemplo interpretar diagramas de arquitectura o capturas de errores en un flujo de soporte técnico.
- Servidor local de chat para equipos pequeños: la imagen Docker con API OpenAI/Anthropic permite desplegar un endpoint compatible en una estación con RTX 4090 o 5090, con 12,2 a 15,7 GiB de VRAM en reposo según configuración.
- Generación de código asistida con contexto de repositorio: el contexto largo y el soporte de tool calling permiten integrar el modelo en pipelines que consultan ficheros, ejecutan tests y proponen parches en varios pasos.
- Evaluación de modelos ternarios en investigación: el artefacto sirve para medir el impacto real de la cuantización ternaria con rotación Hadamard frente a fp16 en tareas de razonamiento, usando la misma infraestructura NInfer.
- Prototipado de agentes multi-paso: la combinación de decodificación especulativa (DFlash2 o MTP) y API compatible con OpenAI reduce la latencia percibida en bucles de agente con muchas llamadas cortas.
- Despliegue en estaciones Blackwell: los perfiles de ruta medidos para RTX PRO 6000 Blackwell permiten servir el modelo en entornos profesionales sin calibración manual, con arranque inmediato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son medidas de memoria y velocidad relativa del servidor:

| Metrica | Valor |
|---|---|
| VRAM en reposo, KV `rk8v4`, sin especulacion | 14,2 GiB (RTX 3090; 4090 y 5090 difieren ≤ 0,2 GiB) |
| VRAM en reposo, KV `rk8v4`, MTP 3 borradores | 15,0 GiB |
| VRAM en reposo, KV `rk8v4`, DFlash2 5 borradores | 15,7 GiB |
| VRAM en reposo, KV `rk4v4`, sin especulacion | 12,2 GiB |
| VRAM en reposo, KV `rk4v4`, DFlash2 5 borradores | 13,7 GiB |
| Coste de cabeza MTP (ventana 198.400) | 0,73 GiB (0,42 GiB pesos + KV y grafos) |
| Coste de cabeza de propuesta con `--lm-head-draft` | 0,16 GiB |
| Coste de adaptador DFlash2 | 1,48 GiB |
| Coste de torre de visión residente | 0,73 GiB |
| Ganancia de MTP con `--lm-head-draft` | 4 % más rápido, misma tasa de aceptación |

## Requisitos de hardware

- VRAM estimada: entre 12,2 y 15,7 GiB para el servidor en reposo con ventana completa de 262.144 tokens, texto solo y una lane, según KV cache y modo de especulación. Añadir visión en overlay requiere `--vision-max-merged 12288` con drafter o 8192 sin él.
- GPUs con perfil de ruta medido integrado: RTX 3090, RTX 4090, RTX 5090 y las tres ediciones de RTX PRO 6000 Blackwell. Cualquier otra GPU se calibra una vez al primer arranque (20 a 40 segundos) y conserva el resultado en el volumen `ninfer-cache`.
- Cabe en GPU consumer: sí, en RTX 3090, 4090 y 5090 con las configuraciones indicadas.
- Requisitos de software: driver NVIDIA de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit para la imagen Docker; para compilar desde fuente, `CMAKE_CUDA_ARCHITECTURES` debe ser `86`, `89` o `120a`, y `120a` exige CUDA 13.1 o superior.
- Opciones de despliegue: imagen `ghcr.io/iamwavecut/ninfer-all` o binario `ninfer-serve` compilado desde la rama `master` de `iamwavecut/ninfer-all`. Las builds estándar de NInfer rechazan este fichero porque `t2_g128_fp16` y el auxiliar `hadamard_signs` solo existen en esa línea.
- Latencia y throughput: no disponibles más allá de la mejora relativa del 4 % en MTP con `--lm-head-draft` y la recomendación de 7 borradores en respuestas cortas y entre 3 y 7 tras documentos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B NInfer v3 (este) | 27B | 262.144 | Ternario 2 bits + Q8/Q4 en cabezas | Apache 2.0 | Fichero `.ninfer` en HF, motor NInfer-all |
| Ternary Bonsai 2 27B GGUF (prism-ml) | 27B | no disponible | GGUF ternario (PQ2_0) | Apache 2.0 | GGUF en HF, motor llama.cpp |
| Qwen3.8-27B (origen de visión y MTP) | 27B | no disponible | fp16/BF16 y cuantizaciones estándar | no disponible | Pesos completos en HF |

La comparativa con modelos de la misma categoría fuera del ecosistema Bonsai no está disponible en la información proporcionada. La diferencia principal frente al GGUF original es el empaquetado multimodal y de especulación en un solo fichero, junto con la cabeza de propuesta reducida.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el modelo base de PrismML y la torre de visión de Qwen3.8, los sesgos de esos modelos se trasladan sin que se documenten aquí.
- Riesgo de alucinación: no cuantificado; no hay benchmarks publicados que permitan estimar la degradación frente a fp16 por la cuantización ternaria.
- Compatibilidad restringida: las builds estándar de NInfer rechazan el fichero; solo funciona con la rama `master` de `iamwavecut/ninfer-all`, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Dependencia de driver y CUDA: requiere driver 580 o superior de la rama CUDA 13 y, para `120a`, CUDA 13.1 o superior.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluación previa.
- La calibración automática en GPUs no listadas tarda entre 20 y 40 segundos en el primer arranque y depende del volumen `ninfer-cache` para persistir.
- El modo visión en overlay toma prestada memoria del dispositivo de la cabeza de salida, la tabla de tokens y el drafter, con restauración posterior; conviene validar el comportamiento bajo carga concurrente.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales del modelo base ni de los componentes MTP y DFlash2 más allá de su licencia declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Ternary-Bonsai-2-27B-NInfer-v3
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabeza MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Adaptador DFlash2: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Motor NInfer original: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de referencia: https://github.com/iamwavecut/ninfer-all/commit/2172a598
- Instrucciones Docker: https://github.com/iamwavecut/ninfer-all#docker
- Instrucciones de compilación: https://github.com/iamwavecut/ninfer-all#building
