# teddyoas/Agron-english-epoch1

## Resumen

Agron-english-epoch1 es un modelo de lenguaje de tipo base (domain-pretrained) desarrollado por el usuario teddyoas, derivado de su modelo previo teddyoas/Agron mediante un epoch adicional de preentrenamiento continuado sobre un corpus en inglés compuesto por wikitext y fineweb-edu. Con 50,3 millones de parámetros, se trata de un modelo muy pequeño orientado a generación de texto, y su interés principal no radica en capacidades de propósito general, sino en servir como banco de pruebas reproducible de dinámicas de preentrenamiento continuado y de olvido catastrófico en dominios especializados.

El modelo parte de un checkpoint ya ajustado en dominios de código y ciberseguridad (según indican sus etiquetas) y, tras un único epoch sobre texto general en inglés, mejora notablemente la perplejidad en wikitext y fineweb (de ~5,1 a ~3,65) a costa de degradar de forma acusada el rendimiento en los dominios originales de código (de 1,245 a 2,356) y ciberseguridad (de 1,064 a 3,592). Este comportamiento lo convierte en un caso de estudio útil para quienes investigan la estabilidad de dominios durante el preentrenamiento continuado.

La arquitectura es un transformer de tipo Llama con un contexto de bloque de 512 tokens durante el entrenamiento, distribuido en formato safetensors y con licencia MIT. No está pensado para uso en producción como asistente general, sino como artefacto de investigación y como base para experimentos posteriores de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según etiqueta `llama`) |
| Parametros totales | 50.340.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana oficial; block size de entrenamiento de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, con 50,3 millones de parámetros, según la etiqueta `llama` y el recuento real de safetensors. Se obtiene por preentrenamiento continuado desde teddyoas/Agron durante un único epoch completo sobre un corpus en inglés compuesto por Salesforce/wikitext y HuggingFaceFW/fineweb-edu. El entrenamiento se realizó con block size de 512, batch de 16 con acumulación de gradiente de 2, learning rate de 3e-4 y 100 pasos de warmup, sumando 6.494 pasos y 106.397.696 tokens en 3.303,3 segundos sobre una única GPU Tesla T4 en fp16.

No se documentan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal; el proceso es un preentrenamiento de lenguaje autorregresivo estándar (probablemente con pérdida de entropía cruzada sobre tokens). La innovación relevante del artefacto es metodológica: el autor publica métricas de evaluación held-out antes y después del entrenamiento por dominio, lo que permite cuantificar el olvido catastrófico inducido por el nuevo corpus. Los datos de entrenamiento no detallan composición exacta (proporción wikitext/fineweb-edu) ni filtros aplicados más allá de las fuentes citadas.

## Capacidades

- Generación de texto autorregresiva en inglés, orientada a continuación de texto y modelado de lenguaje general.
- Capacidad residual de código y ciberseguridad heredada del modelo base teddyoas/Agron, aunque notablemente degradada tras este epoch (perplejidad en código sube de 1,245 a 2,356 y en cyber de 1,064 a 3,592).
- Modelado de lenguaje general en inglés con perplejidad baja en wikitext y fineweb-edu (3,661 y 3,652 respectivamente).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve para reproducir y analizar cómo un epoch de preentrenamiento continuado sobre texto general degrada dominios especializados, usando las métricas antes/después publicadas como referencia.
- Banco de pruebas de preentrenamiento continuado: permite validar pipelines de entrenamiento de bajo coste (una sola T4, ~55 minutos) antes de escalar a modelos mayores.
- Generación de texto en inglés de dominio general: adecuado para tareas de continuación de texto o generación corta donde la perplejidad en wikitext/fineweb sea el criterio relevante.
- Base para ajuste fino posterior: al ser un modelo pequeño con licencia MIT, puede usarse como punto de partida para experimentos de fine-tuning específicos de dominio con recursos muy limitados.
- Evaluación de técnicas de mitigación de olvido: útil para comparar estrategias como replay de datos, regularización o mezcla de corpus frente a este checkpoint de referencia.
- Docencia y demostraciones: su tamaño (0,2 GB de repo) permite ejecutarlo en entornos educativos y de prototipado rápido sin infraestructura dedicada.
- Experimentos de destilación o compresión: como modelo base pequeño, puede servir de alumno o de referencia en estudios de compresión de modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son perplejidades held-out antes y después del epoch de preentrenamiento continuado:

| Fuente | Antes | Después | Delta |
|---|---|---|---|
| wikitext | 5,103 | 3,661 | -1,442 |
| fineweb | 5,129 | 3,652 | -1,477 |
| code | 1,245 | 2,356 | +1,110 |
| cyber | 1,064 | 3,592 | +2,529 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (50,3 M de parámetros, ~100 MB de pesos) y del orden de 200-300 MB en fp32 con overhead de runtime; los pesos en safetensors ocupan aproximadamente 0,2 GB de repositorio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó en una Tesla T4, por lo que T4, RTX 3060, RTX 4090 o incluso CPU son viables.
- Cabe holgadamente en cualquier GPU consumer, incluida GTX 1650 o inferiores, y en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con PyTorch es la vía natural; no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son compatibles en teoría con arquitectura Llama, aunque no hay configuraciones publicadas.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Agron-english-epoch1 | 50,3 M | 512 (entrenamiento) | MIT | Preentrenamiento continuado en inglés |
| teddyoas/Agron (base) | no disponible en la información | no disponible | no disponible en la información | Código y ciberseguridad |
| Modelos tipo GPT-2 small | ~124 M | 1.024 | MIT | Texto general en inglés |
| Modelos tipo SmolLM-135M | ~135 M | 2.048 | Apache 2.0 | Texto general multilingüe |

La comparación con alternativas comerciales o de mayor tamaño no resulta significativa por la diferencia de escala; los modelos citados son referencias de la misma categoría (decenas a centenares de millones de parámetros) y los datos de contexto y licencia de Agron no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Olvido catastrófico documentado: el rendimiento en código y ciberseguridad se degrada de forma severa tras el epoch (perplejidad en cyber se multiplica por más de 3).
- Ventana de contexto efectiva limitada: el entrenamiento usa block size de 512, por lo que no debe esperarse buen rendimiento más allá de esa longitud.
- Solo inglés: no se declara ni evalúa capacidad multilingüe.
- Riesgo de alucinación alto por su escala (50 M de parámetros) y por tratarse de un modelo base sin ajuste de instrucciones.
- No apto para producción como asistente conversacional: no hay alineación, ni RLHF, ni evaluación de seguridad.
- Sesgos: no se documentan análisis de sesgo; al entrenar sobre wikitext y fineweb-edu, hereda los sesgos de esas fuentes.
- Licencia MIT permite uso comercial, pero el modelo no ofrece garantías de calidad ni de seguridad para aplicaciones reales.
- Fecha de creación del repositorio (2026-10-26) posterior a la fecha actual de referencia; conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/teddyoas/Agron-english-epoch1
- Modelo base: https://huggingface.co/teddyoas/Agron
- Corpus wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Corpus fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
