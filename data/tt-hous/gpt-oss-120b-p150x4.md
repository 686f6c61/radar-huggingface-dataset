# tt-hous/gpt-oss-120b-p150x4

## Resumen

tt-hous/gpt-oss-120b-p150x4 es un paquete de contenedor tt-model que sirve el modelo openai/gpt-oss-120b de OpenAI sobre cuatro placas Tenstorrent P150. Está desarrollado por tt-hous y su objetivo es simplificar el despliegue: en lugar de instalar tt-metal, vLLM y configurar el entorno manualmente, el usuario solo necesita Docker y una tarjeta Tenstorrent. El contenedor incluye el stack de servicio (vLLM con el plugin de Tenstorrent) y descarga los pesos del modelo base en el momento de la extracción, sin incrustarlos en la imagen. Es relevante porque permite evaluar gpt-oss-120b en hardware especializado de Tenstorrent con una configuración reproducible y medidas de latencia documentadas. La arquitectura del modelo base no se detalla en la información del paquete, pero el contenedor expone una ventana de contexto de 131072 tokens y requiere un clúster de cuatro P150.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | 131072 tokens (max_model_len del perfil de servicio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el contenedor; el modelo base openai/gpt-oss-120b se publica bajo Apache 2.0 según OpenAI |
| Formato de pesos | No disponible (los pesos se descargan a la caché de HuggingFace en el momento de la extracción) |
| Tamaño del repositorio | 1.3 GB |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado, sino un contenedor de servicio. Incluye una imagen Docker con tt-metal, vLLM y el plugin de Tenstorrent, y descarga los pesos de openai/gpt-oss-120b en el momento de la extracción. No se proporcionan detalles sobre la arquitectura del modelo base ni sobre sus datos de entrenamiento. El README indica que el contenedor se construyó con tt-metal en el commit `6ea930fd3d5dee17a076916eda2cdc2d8e5ba380` (árbol sucio), vLLM sin versión fijada y el plugin en `053c0782aa11028924c21cb061ffa76576705cad`. El perfil de servicio por defecto usa cuatro placas P150 en configuración de malla P150x4 y una longitud máxima de modelo de 131072 tokens.

## Capacidades

- Servicio de gpt-oss-120b mediante vLLM con API compatible con OpenAI.
- Ventana de contexto de 131072 tokens.
- Hasta 32 secuencias simultáneas por servidor (max_num_seqs).
- Descarga de pesos bajo demanda desde HuggingFace en el momento de la extracción.
- Soporte de tool calling heredado del modelo base, según la documentación de OpenAI.
- No se documentan capacidades de visión, audio ni multimodales en el paquete.

## Casos de uso

- Despliegue de gpt-oss-120b en producción sobre hardware Tenstorrent: el contenedor elimina la necesidad de instalar tt-metal y vLLM manualmente, lo que reduce el tiempo de puesta en marcha y evita errores de configuración. Es adecuado para equipos que ya tienen tarjetas P150 y quieren servir el modelo con una API compatible con OpenAI.
- Procesamiento de documentos largos: con una ventana de contexto de 131072 tokens, el contenedor permite analizar documentos extensos, como contratos, informes técnicos o transcripciones, sin necesidad de dividirlos en fragmentos. Las medidas de latencia indican que para 32768 tokens de entrada y 128 de salida, el tiempo hasta el primer token es de unos 122,80 segundos.
- Evaluación de rendimiento en hardware especializado: el README incluye mediciones deterministas con temperatura 0 y concurrencia 1, lo que permite comparar la latencia de gpt-oss-120b en P150x4 con otros entornos. Los desarrolladores pueden usar estos valores como referencia para dimensionar sus propios despliegues.
- Integración en pipelines de agentes con tool calling: el modelo base es conocido por su soporte de herramientas, y el contenedor lo sirve a través de vLLM, que soporta llamadas a funciones. Esto permite construir agentes que consulten APIs externas, bases de datos o servicios internos.
- Investigación sobre eficiencia de inferencia en hardware Tenstorrent: el paquete fija las versiones de tt-metal, vLLM y el plugin, lo que proporciona un entorno reproducible para experimentos de rendimiento y análisis de cuellos de botella.
- Aplicaciones de razonamiento con contexto largo: gracias a la ventana de 131072 tokens, el modelo puede mantener conversaciones multi-turno extensas o resolver problemas que requieren retener mucha información. El perfil de servicio permite hasta 32 usuarios concurrentes.
- Despliegue en entornos sin gestión de dependencias: al ser una imagen Docker, el contenedor se puede ejecutar en máquinas con solo Docker y una tarjeta Tenstorrent, sin necesidad de entornos virtuales ni compilaciones de tt-metal.

## Benchmarks y rendimiento

Las siguientes mediciones se realizaron en un servidor caliente, con concurrencia 1 y temperatura 0 (muestreo greedy) para hacer los resultados deterministas y repetibles. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Entrada (tokens) | Salida (tokens) | TTFT | TPOT | Tokens/s por usuario |
|---|---:|---:|---:|---:|
| 128 | 128 | 0,500 s | 18,27 ms | 54,73 |
| 8192 | 1024 | 29,27 s | 19,14 ms | 52,26 |
| 32768 | 128 | 122,80 s | 20,72 ms | 48,27 |
| 65536 | 128 | 240,11 s | 23,07 ms | 43,36 |

## Requisitos de hardware

- Se requiere un clúster de cuatro placas Tenstorrent P150 (perfil P150x4). El README indica explícitamente que P150 y P150x2 no son suficientes porque el estado residente del modelo no cabe en esas configuraciones.
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: Tenstorrent P150x4 (arquitectura Blackhole).
- Opciones de despliegue: Docker, tt-model (pull y serve), vLLM con plugin de Tenstorrent.
- Latencia y throughput: ver tabla de benchmarks. El primer arranque en frío tarda 14m25s; un reinicio en caliente, 6m50s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos o configuraciones de despliegue. El paquete se limita a servir openai/gpt-oss-120b en P150x4.

## Limitaciones y advertencias

- Requiere hardware específico de Tenstorrent (P150x4); no se puede ejecutar en GPUs NVIDIA ni en configuraciones con menos de cuatro P150.
- El primer arranque compila kernels y tensores, lo que puede tardar más de 14 minutos. Los reinicios en caliente tardan unos 7 minutos.
- La licencia del contenedor no está especificada en la información disponible. El modelo base se publica bajo Apache 2.0, pero el usuario debe verificar las condiciones de uso del paquete.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma del modelo base en la información del contenedor.
- Las mediciones de latencia se obtuvieron con temperatura 0 y concurrencia 1, por lo que no representan condiciones de producción con carga concurrente.
- El paquete fija versiones de tt-metal y del plugin, pero no fija la versión de vLLM (aparece como None), lo que puede afectar a la reproducibilidad.

## Enlaces

- https://huggingface.co/tt-hous/gpt-oss-120b-p150x4
- https://huggingface.co/openai/gpt-oss-120b
- https://openai.com/index/introducing-gpt-oss/
