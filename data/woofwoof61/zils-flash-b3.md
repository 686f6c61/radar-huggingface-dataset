# woofwoof61/zils-flash-b3

## Resumen

Zils d3-flash body es un modelo de 8.392.695.024 parametros publicado por el usuario woofwoof61 en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos de lenguaje y vision de bigai/GS1-9B (revision `76c52a519d9810749a5a5b109669fca350007924`), que a su vez es un fine-tune de Qwen/Qwen3.5-9B. El autor declara explicitamente que los pesos no han sido modificados y que todo el credito corresponde a los autores originales.

La particularidad del artefacto es el formato: los pesos se almacenan en la disposicion denominada "d3-flash body" y se presentan como "soup body" para el pool d3-flash de la subred Zils (subnet 127). Es, por tanto, un componente pensado para participar en un ecosistema de modelos de decision distribuidos, no un modelo de proposito general listo para produccion.

La relevancia practica es limitada fuera de ese contexto: el repositorio no incluye pipeline declarado, no documenta idiomas soportados ni resultados de evaluacion, y no aporta informacion sobre el proceso de entrenamiento mas alla de la herencia del modelo base. Para quien necesite un modelo de ~8.400 millones de parametros con vision y lenguaje, la referencia directa deberia ser bigai/GS1-9B o Qwen/Qwen3.5-9B, no este reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de bigai/GS1-9B, fine-tune de Qwen/Qwen3.5-9B; no se detalla en la model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF declaradas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 16,8 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo unico documentado es la cadena de procedencia: los pesos de lenguaje y vision de bigai/GS1-9B se conservan sin cambios y se almacenan en la disposicion "d3-flash body". GS1-9B es, a su vez, un fine-tune de Qwen/Qwen3.5-9B, de modo que las decisiones arquitectonicas (tipo de transformer, atencion, tokenizador) corresponden a esa estirpe y no se detallan aqui.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor no realizo entrenamiento adicional segun su propia declaracion: se limita a reempaquetar pesos existentes y a publicarlos como cuerpo candidato para el pool d3-flash de la subred Zils 127.

## Capacidades

- Generacion de lenguaje y procesamiento multimodal texto-imagen: heredadas de bigai/GS1-9B, que conserva los pesos de lenguaje y vision del modelo original.
- Razonamiento y codigo: presumiblemente disponibles por herencia de Qwen/Qwen3.5-9B, aunque no se documentan ni se evaluan en este repositorio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.
- Integracion en el ecosistema Zils: el artefacto esta formateado como "soup body" para el pool d3-flash de la subred 127.

## Casos de uso

- Participacion en el pool d3-flash de la subred Zils 127: el proposito declarado del repositorio es servir como cuerpo candidato ("soup body") en ese pool, por lo que su uso principal es la experimentacion dentro de esa red.
- Punto de partida para fine-tuning multimodal: al conservar los pesos de lenguaje y vision de GS1-9B en safetensors, puede servir como base para ajustes posteriores, aunque sin garantias de que el reempaquetado no introduzca diferencias de comportamiento.
- Investigacion sobre formatos de empaquetado de pesos: util para estudiar como se reorganizan los tensores de un modelo de ~8.400 millones de parametros en la disposicion d3-flash y que implicaciones tiene en la carga.
- Replicacion de experimentos con GS1-9B: quien ya trabaje con el modelo base puede comparar el comportamiento del reempaquetado frente al original para detectar regresiones de conversion.
- Despliegue en infraestructura propia: los 16,8 GB en safetensors permiten cargar el modelo en GPUs de 24 GB o superiores en precision nativa, o en GPUs menores mediante cuantizacion propia (no se ofrecen ficheros GGUF).
- Docencia y auditoria de linajes de modelos: la cadena Qwen3.5-9B -> GS1-9B -> zils-flash-b3 es un ejemplo claro de reempaquetado y herencia de licencias Apache-2.0 que puede usarse en materiales formativos sobre trazabilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,8 GB en el formato safetensors publicado (pesos de 8.392.695.024 parametros); en fp16 el calculo coincide con el tamano del repo. Con cuantizacion a 8 bits se reduce a unos 8,4 GB y a 4 bits a unos 4,2 GB, aunque el repositorio no incluye ficheros cuantizados.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para inferencia en precision nativa con margen para cache KV. Una RTX 4090 de 24 GB puede alojar los pesos en fp16, pero el margen para contexto largo depende de la longitud de contexto del modelo base, que no se documenta.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16, y en tarjetas de 12-16 GB si se cuantiza manualmente.
- Opciones de despliegue: vLLM, TGI o llama.cpp requieren que la disposicion d3-flash sea convertible al formato esperado por cada motor; el repositorio no documenta ninguna herramienta de conversion. Ollama no dispone de fichero GGUF publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-b3 | 8.392.695.024 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Reempaquetado d3-flash de GS1-9B para la subred Zils |
| bigai/GS1-9B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | Hugging Face | Modelo base original; mantiene pesos de lenguaje y vision sin reempaquetar |
| Qwen/Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo raiz del linaje; fine-tuneado por bigai para dar lugar a GS1-9B |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar los pesos de Qwen3.5-9B y GS1-9B, arrastra los sesgos de esos modelos, que no se detallan en este repositorio.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni pruebas de fidelidad publicadas.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados, ya que la model card no los declara.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al derivar de GS1-9B y Qwen3.5-9B conviene verificar las condiciones de la cadena completa antes de desplegar en produccion.
- Ausencia de pipeline declarado: el repositorio no especifica tarea, lo que complica el uso directo con `transformers` sin inspeccionar la configuracion.
- Formato no estandar: la disposicion d3-flash puede no ser cargable por motores convencionales sin una conversion previa no documentada.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-25, lo que conviene tener en cuenta al evaluar su trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woofwoof61/zils-flash-b3
- Modelo base GS1-9B: https://huggingface.co/bigai/GS1-9B
- Modelo raiz Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
