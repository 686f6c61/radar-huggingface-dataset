# WorkOffline/NVIDIA-Nemotron-3-Nano-4B-GGUF

## Resumen

NVIDIA Nemotron 3 Nano 4B es un modelo de lenguaje conversacional de aproximadamente 3.970 millones de parametros desarrollado por NVIDIA. Esta ficha cubre la distribucion GGUF del modelo, publicada por el usuario WorkOffline como espejo (mirror) sin modificaciones de los archivos oficiales de NVIDIA, con el objetivo de que la aplicacion WorkOffline pueda descargarlos desde un unico punto fijado a una revision concreta y verificado mediante SHA-256. El modelo base en precision BF16 es `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y los archivos GGUF provienen de `nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF`.

El interes de esta publicacion es practico: ofrece un artefacto cuantizado en formato Q4_K_M (2.837.072.864 bytes, aproximadamente 2,8 GB) listo para inferencia local con herramientas compatibles con GGUF, como llama.cpp u Ollama. El repositorio incluye la licencia y el aviso (NOTICE) de NVIDIA, y declara compatibilidad con endpoints, lo que facilita su integracion en flujos de trabajo que consumen modelos mediante API compatible con OpenAI.

No se dispone de informacion publicada en esta ficha sobre la longitud de contexto, la composicion del dataset de entrenamiento, los idiomas soportados ni los resultados de benchmarks. Cualquier dato de ese tipo debe consultarse en la model card oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.973.556.832 (aproximadamente 4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (modelo base en BF16: safetensors) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna del modelo (tipo de transformer, uso de atencion lineal, mezcla de expertos u otras innovaciones), ni el volumen o composicion de los datos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato estructural confirmado es el recuento de parametros: 3.973.556.832, lo que situa al modelo en la categoria de aproximadamente 4B parametros.

Respecto a esta distribucion concreta, se trata de una copia byte a byte de los archivos GGUF oficiales de NVIDIA, fijada a la revision `ba223d14e45525f7fae81db77ea8cabeb2fc6c25` del repositorio `nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF`. El unico archivo incluido es `NVIDIA-Nemotron3-Nano-4B-Q4_K_M.gguf`, con SHA-256 `be5d9a656a51922f24f1f09a759cebb694e1f5d9728bf0ef9f8c972c5a0b5ef2`. La conversion a GGUF la realizo NVIDIA, no el publicador del espejo.

## Capacidades

- Generacion de texto conversacional: el repositorio declara la etiqueta `conversational`, lo que indica un modelo ajustado para dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el formato estandar de endpoints.
- Inferencia local: al estar en formato GGUF, es ejecutable con llama.cpp y herramientas derivadas, incluyendo despliegue en CPU y GPU.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portatil o estacion de trabajo sin conexion gracias a su cuantizacion Q4_K_M de aproximadamente 2,8 GB, lo que permite desplegar un chatbot de proposito general en entornos con requisitos de privacidad o sin acceso a red.
- Integracion en la aplicacion WorkOffline: el repositorio esta disenado explicitamente para que dicha aplicacion descargue el archivo desde un unico punto fijado a una revision y verifique su integridad mediante SHA-256, lo que simplifica la distribucion reproducible del modelo a los usuarios finales.
- Prototipado rapido de aplicaciones de texto: al ser un modelo de aproximadamente 4B parametros en GGUF, permite iterar sobre prompts y flujos conversacionales en hardware de consumo antes de escalar a modelos mayores.
- Servicio de inferencia ligero con API compatible: la etiqueta `endpoints_compatible` facilita exponer el modelo mediante un servidor local compatible con la API de OpenAI, util para pruebas de integracion de aplicaciones que ya consumen ese formato.
- Procesamiento por lotes en CPU: la cuantizacion Q4_K_M permite ejecutar el modelo en servidores sin GPU para tareas de generacion de texto de baja concurrencia, como resumen o clasificacion de documentos.
- Entornos educativos y de investigacion: un modelo de 4B con licencia abierta de NVIDIA es adecuado para experimentos de ajuste fino, evaluacion de tecnicas de cuantizacion o estudios comparativos de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 2,8 GB, por lo que se necesita un margen adicional para el contexto y el estado de inferencia; en la practica, entre 3,5 y 5 GB de memoria suele ser suficiente, aunque el valor exacto depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) deberia poder alojar el modelo cuantizado; no se dispone de datos oficiales de NVIDIA al respecto.
- Cabe en GPU consumer: si, segun el tamano del archivo Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, entre otras); la etiqueta `endpoints_compatible` sugiere servidores compatibles con API de endpoints. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas (contexto, benchmarks) de este modelo ni de alternativas, por lo que no es posible establecer una comparativa rigurosa. La tabla siguiente recoge unicamente los datos confirmados de esta distribucion.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3 Nano 4B (este repo) | 3.973.556.832 | no disponible | Q4_K_M | NVIDIA Nemotron Open Model License | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; deben consultarse en la model card oficial de NVIDIA.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo de lenguaje de aproximadamente 4B parametros, es esperable que exista, pero no se aportan datos.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan disponibles en esta ficha.
- Restricciones de licencia: el uso se rige por la NVIDIA Nemotron Open Model License, que no es una licencia de codigo abierto estandar. Es obligatorio conservar el aviso requerido: "Licensed by NVIDIA Corporation under the NVIDIA Nemotron Model License". Antes de un uso comercial es imprescindible revisar el texto completo de la licencia en el enlace oficial.
- Integridad del artefacto: el publicador indica que los bytes son identicos a los archivos oficiales de NVIDIA y proporciona el SHA-256; conviene verificarlo tras la descarga.
- Este repositorio es un espejo no oficial: no lo mantiene NVIDIA, y su disponibilidad depende del publicador WorkOffline.
- Caveat de produccion: al ser una cuantizacion Q4_K_M, puede existir una degradacion de calidad respecto al modelo BF16 original; no se han publicado metricas que cuantifiquen esa diferencia.

## Enlaces

- Repositorio de esta distribucion GGUF: https://huggingface.co/WorkOffline/NVIDIA-Nemotron-3-Nano-4B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- GGUF oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
