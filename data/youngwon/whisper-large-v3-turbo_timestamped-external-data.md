# Youngwon/whisper-large-v3-turbo_timestamped-external-data

## Resumen

Este repositorio no introduce un modelo nuevo, sino que reempaqueta los pesos ONNX cuantizados (q4 y q4f16) de `onnx-community/whisper-large-v3-turbo_timestamped`, que a su vez es una exportación ONNX de `openai/whisper-large-v3-turbo` (licencia MIT, Copyright OpenAI). Lo publica el usuario Youngwon y el único cambio respecto al original es la disposición de archivos: los pesos de nivel superior salen del fichero `.onnx` y pasan a un fichero `.onnx_data` externo (formato de datos externos de ONNX). Los valores de los pesos son idénticos.

El objetivo de este reempaquetado es que onnxruntime-web (WebGPU) pueda subir los pesos directamente a la GPU, reduciendo el uso de memoria WASM en el navegador. Los tensores internos de los subgrafos permanecen dentro del `.onnx`. Está pensado para reconocimiento automático del habla (ASR) en el navegador mediante transformers.js.

El modelo base `whisper-large-v3-turbo` es una versión optimizada de `whisper-large-v3` que ofrece mayor velocidad de transcripción con una degradación mínima de la precisión. El repositorio tiene 0 descargas y 0 likes, y está etiquetado para coreano (ko). Es un artefacto de despliegue, no un modelo entrenado de nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (formato de la arquitectura Whisper) |
| Tipos de cuantizacion | q4 y q4f16 |
| Idiomas soportados | ko (segun las etiquetas del repositorio); el modelo base openai/whisper-large-v3-turbo es multilingue |
| Licencia | MIT (Copyright OpenAI) |
| Formato de pesos | ONNX (.onnx con datos externos en .onnx_data) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder diseñado para ASR y traducción de voz. El encoder procesa espectrogramas en ventanas de 30 segundos y el decoder genera texto de forma autorregresiva. El repositorio no entrena nada: solo redistribuye los pesos ya exportados a ONNX y cuantizados por la comunidad ONNX, y cambia su ubicación en disco.

El modelo base `openai/whisper-large-v3-turbo` es una versión podada y ajustada de `whisper-large-v3`. Según la documentación de OpenAI, se entrenó sobre más de 5 millones de horas de datos etiquetados y mantiene capacidad de generalización zero-shot en múltiples dominios. La variante turbo reduce el coste computacional a cambio de una degradación mínima de la precisión. En este repositorio, la innovación no está en el modelo sino en el empaquetado ONNX con datos externos: los grafos disponibles son `encoder_model_q4f16.onnx` + `.onnx_data`, `decoder_model_merged_q4f16.onnx` + `.onnx_data`, `encoder_model_q4.onnx` + `.onnx_data` y `decoder_model_merged_q4.onnx` + `.onnx_data`.

## Capacidades

- Transcripción de voz a texto (ASR) en coreano, heredada del modelo base.
- Generación de timestamps (la variante se denomina `timestamped`), útil para subtítulos alineados temporalmente.
- Inferencia en navegador mediante transformers.js y onnxruntime-web con aceleración WebGPU.
- Ejecución con las variantes cuantizadas q4 y q4f16, pensadas para reducir el uso de memoria WASM al mover los pesos a la GPU.
- Capacidad multilingüe potencial heredada de `whisper-large-v3-turbo`, aunque el repositorio solo declara el coreano en sus etiquetas.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No dispone de capacidades de visión, audio más allá del ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de voz en el navegador: con transformers.js y WebGPU, el modelo puede ejecutar ASR directamente en la pestaña del usuario sin enviar audio a un servidor, gracias al empaquetado con datos externos que reduce la memoria WASM.
- Generación de subtítulos con marcas de tiempo: la variante `timestamped` permite alinear cada segmento de texto con su intervalo temporal para producir ficheros de subtítulos (por ejemplo, SRT o VTT) en aplicaciones web.
- Aplicaciones web de accesibilidad: transcripción en vivo de audio para personas con dificultades auditivas, ejecutada en el cliente para evitar latencia de red y proteger la privacidad del audio.
- Integración en transbee: el autor indica que este repositorio lo consume el proyecto transbee (github.com/ian-yw/transbee), por lo que sirve como dependencia de una herramienta de transcripción/traducción concreta.
- Dictado en coreano dentro de aplicaciones ofimáticas o editores: el modelo está etiquetado para coreano, lo que lo hace adecuado para entrada de texto por voz en ese idioma.
- Procesamiento por lotes en el navegador: transcripción de grabaciones preexistentes (reuniones, notas de voz, entrevistas) sin backend, usando una sola variante cuantizada cargada en GPU.
- Demos y prototipos de ASR: al publicarse como artefacto ONNX listo para transformers.js, permite construir pruebas de concepto de reconocimiento de voz en cuestión de minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La documentación del modelo base de OpenAI menciona de forma cualitativa que la variante turbo ofrece mayor velocidad de transcripción con una degradación mínima de la precisión, pero no se proporcionan cifras concretas (WER, latencia, throughput) ni comparaciones numéricas en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio completo: 1,3 GB, que incluye las variantes q4 y q4f16 (encoder y decoder). No se detalla el desglose por fichero; una sola variante cuantizada ocuparía previsiblemente varios cientos de MB.
- VRAM estimada: no disponible de forma explícita. Al tratarse de pesos cuantizados a 4 bits sobre un modelo de tamaño para escritorio, se espera que quepa en GPUs de consumo e incluso en GPUs integradas compatibles con WebGPU, aunque no hay cifras confirmadas.
- GPU recomendadas: no disponible. El diseño apunta a ejecución en navegador vía WebGPU, por lo que cualquier GPU con soporte WebGPU estable podría servir; en servidor, se aplican las recomendaciones habituales del modelo base.
- Cabida en GPU de consumo: previsiblemente sí, dada la cuantización q4/q4f16 y el enfoque de despliegue en navegador, aunque no se confirma con datos publicados.
- Opciones de despliegue: transformers.js y onnxruntime-web con WebGPU son el destino declarado. También puede ejecutarse con ONNX Runtime en servidor, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato y cuantizacion | Cambio respecto al original | Licencia | Disponibilidad |
|---|---|---|---|---|
| Youngwon/whisper-large-v3-turbo_timestamped-external-data | ONNX con datos externos (.onnx + .onnx_data), q4 y q4f16 | Solo la disposición de archivos; pesos identicos | MIT | 0 descargas, 0 likes |
| onnx-community/whisper-large-v3-turbo_timestamped | ONNX estandar, incluidos q4 y q4f16 | Exportacion ONNX de referencia de la que deriva este repositorio | MIT | Repositorio comunitario de origen |
| openai/whisper-large-v3-turbo | Pesos originales (formato propio de OpenAI) | Modelo base; variante optimizada de large-v3 | MIT | Modelo oficial de OpenAI |
| openai/whisper-large-v3 | Pesos originales | Version mayor, mas lenta segun OpenAI | MIT | Modelo oficial de OpenAI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no mejora el modelo: es un reempaquetado de pesos ya existentes, por lo que hereda todas las limitaciones de `whisper-large-v3-turbo` y de su cuantización q4/q4f16.
- La cuantización a 4 bits puede degradar la precisión de transcripción respecto a los pesos en precisión completa; no hay métricas publicadas que cuantifiquen esa pérdida.
- El repositorio está etiquetado únicamente para coreano (ko). Aunque el modelo base es multilingüe, el comportamiento en otros idiomas no está garantizado ni documentado en esta ficha.
- Whisper es propenso a alucinaciones en segmentos de silencio o audio ruidoso, un riesgo que se mantiene en este empaquetado.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Al tener 0 descargas y 0 likes, carece de validación por parte de la comunidad; conviene verificar la integridad de los pesos antes de usarlo en producción.
- Licencia MIT con Copyright OpenAI, lo que permite uso comercial, pero se debe conservar el aviso de copyright y la atribución correspondiente.
- Al ser un artefacto de despliegue para navegador, su rendimiento real depende del soporte WebGPU del navegador y del hardware del cliente, factores fuera del control del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Youngwon/whisper-large-v3-turbo_timestamped-external-data
- Exportacion ONNX de origen: https://huggingface.co/onnx-community/whisper-large-v3-turbo_timestamped
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Proyecto transbee: https://github.com/ian-yw/transbee
- Repositorio de referencia de la variante turbo: https://github.com/yrsgsda/whisper-large-v3-turbo
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision, Alec Radford et al.): no se proporciona URL directa en la informacion disponible
- Ficha en OpenRouter: https://openrouter.ai/openai/whisper-large-v3-turbo
