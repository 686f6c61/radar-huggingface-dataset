# stage-babylm/llama-64-8L

## Resumen

llama-64-8L es un modelo de lenguaje extremadamente pequeno de 521.408 parametros, publicado por la organizacion stage-babylm en agosto de 2026. Su nombre sugiere una arquitectura tipo Llama con dimension oculta de 64 y 8 capas, lo que cuadra con el recuento de parametros. Se enmarca en la linea de investigacion del desafio BabyLM, centrado en entrenar modelos de lenguaje eficientes con cantidades limitadas de datos. La model card es auto-generada y contiene escasa informacion: se trata de un fine-tuning de un modelo base no identificado sobre un dataset desconocido.

El modelo esta disponible en formato safetensors con pipeline de text-generation y es compatible con text-generation-inference y endpoints de Hugging Face. No se han publicado benchmarks, licencia ni idiomas soportados, y el unico dato de rendimiento es una loss de validacion de 2,0499 tras una epoca de entrenamiento. Con 625 descargas, su interes principal es experimental y educativo, no productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder transformer) |
| Parametros totales | 521.408 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Llama con dimension oculta de 64 y 8 capas, inferencia consistente con los 521.408 parametros totales. Se trata de un fine-tuning de un modelo base no especificado (la URL del modelo base esta vacia en la model card) sobre un dataset no descrito. El entrenamiento utilizo el optimizador AdamW con learning rate de 0,0018, batch size de 32, scheduler coseno con warmup del 5% y una sola epoca, completando 40.278 pasos. La loss de validacion descendio de 6,9231 al inicio a 2,0499 al final. El entrenamiento se realizo con Transformers 5.14.1, PyTorch 2.13.0+cu130 y Datasets 5.0.0.

## Capacidades

- Generacion de texto basica: el pipeline declarado es text-generation.
- Razonamiento, codigo, matematicas o vision: no documentado ni verificable con los datos publicados.
- Tool calling / function calling: no soportado ni documentado.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multilingues: no documentadas.
- Thinking mode, vision o audio: no aplica.

## Casos de uso

- Investigacion sobre eficiencia de entrenamiento: el modelo sirve como punto de referencia para estudiar como modelos muy pequenos aprenden con datos limitados, en el contexto del desafio BabyLM.
- Educacion en arquitecturas transformer: su tamano reducido permite ejecutarlo en CPU y analizar los componentes internos de un decoder Llama (capas de atencion, MLP, embeddings) con fines docentes.
- Experimentos de fine-tuning y evaluacion: permite probar pipelines completos de Hugging Face Transformers (entrenamiento, evaluacion, exportacion) con coste computacional minimo.
- Pruebas de integracion en CI/CD: su formato safetensors y compatibilidad con text-generation-inference lo hacen util para validar despliegues y endpoints en entornos de desarrollo.
- Analisis de curvas de aprendizaje: los datos de entrenamiento publicados (loss por paso durante 40.278 pasos) permiten estudiar la dinamica de convergencia de modelos tiny.
- Comparacion de tecnicas de regularizacion o data-efficient learning: al ser un modelo diminuto, es adecuado para abaratar experimentos comparativos entre estrategias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la loss de validacion de 2,0499 tras una epoca de entrenamiento.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; los pesos en FP32 ocupan aproximadamente 2 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, cualquier GPU moderna, incluidas las integradas.
- Opciones de despliegue: transformers, text-generation-inference, endpoints compatibles de Hugging Face, o cualquier framework que cargue safetensors.
- Latencia: no disponible, pero por tamano se espera latencia de milisegundos en CPU y sub-milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con modelos similares. El ecosistema BabyLM incluye otros modelos tiny, pero no se han publicado especificaciones comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el dataset de entrenamiento es desconocido, por lo que no se puede descartar la presencia de sesgos.
- Riesgo de alucinacion: alto por su tamano reducido; no es adecuado para tareas de generacion factual.
- Limitaciones de contexto: la longitud de contexto no esta publicada; con una dimension oculta de 64, la capacidad de modelar dependencias largas es muy limitada.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se recomienda su uso comercial sin verificar.
- Caveat de produccion: la model card es auto-generada y no contiene informacion sobre el dataset, el modelo base ni los casos de uso previstos; no es apto para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stage-babylm/llama-64-8L
- Repositorio del modelo: https://huggingface.co/stage-babylm/llama-64-8L/tree/main
- Desafio BabyLM: https://babylm.github.io/
