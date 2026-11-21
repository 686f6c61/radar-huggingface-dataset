# timdedid/qwen3-1.7b-gguf

## Resumen

`timdedid/qwen3-1.7b-gguf` es una redistribución no oficial en formato GGUF del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio contiene un único fichero cuantizado en Q4_K_M (aproximadamente 1,36 GB) que corresponde a los pesos empleados por la etiqueta oficial `qwen3:1.7b` de la librería de Ollama. El autor, `timdedid`, publica el fichero por comodidad de descarga, sin afiliación con Qwen, Alibaba ni Ollama.

El modelo base es un transformer de 1.700 millones de parámetros (2.031.739.904 según los pesos reales en safetensors) con una longitud de contexto de 40.960 tokens y una dimensión de embedding de 2048. Incorpora plantilla de chat embebida en el propio GGUF y soporta tres modos de uso: completado de texto, tool calling y modo de razonamiento (thinking mode).

Su relevancia práctica radica en que permite ejecutar un modelo de la familia Qwen3 en hardware de consumo mediante llama.cpp u Ollama, con un tamaño de descarga reducido y licencia Apache-2.0, lo que facilita su integración en prototipos locales, pipelines de CI y entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, identificador `qwen3`) |
| Parametros totales | 1,7B (2.031.739.904 en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repo) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`qwen3-1.7b-Q4_K_M.gguf`, ~1,36 GB) |
| Dimension de embedding | 2048 |
| Plantilla de chat | embebida en el GGUF |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer decoder-only de la familia Qwen3, con 1.700 millones de parámetros y una dimensión de embedding de 2048. La model card de esta redistribución no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la documentación oficial de Qwen, no incluida en la información disponible.

La innovación técnica destacable a nivel de despliegue es la inclusión de la plantilla de chat dentro del propio fichero GGUF, lo que elimina la necesidad de gestionar plantillas externas en llama.cpp u Ollama. El modelo soporta un modo de razonamiento explícito (thinking mode) que puede activarse o desactivarse, con parámetros de muestreo recomendados distintos para cada modo. No se dispone de información sobre técnicas de atención lineal, decodificación especulativa u otras optimizaciones internas en la documentación proporcionada.

## Capacidades

- Generación de texto y completado conversacional multi-turno.
- Modo de razonamiento (thinking mode) activable, con parámetros de muestreo específicos.
- Tool calling / function calling, según la model card.
- Plantilla de chat embebida, lista para uso directo en llama.cpp y Ollama.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte declarado únicamente para inglés; no se confirman otras lenguas en esta redistribución.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Asistente conversacional local:** ejecución mediante `ollama run qwen3:1.7b` o `llama-server` para prototipos de chatbot en máquina de desarrollo, aprovechando la plantilla de chat embebida y el contexto de 40.960 tokens.
- **Automatización de tareas con tool calling:** integración en flujos donde el modelo invoca funciones externas (consultas a APIs, operaciones sobre ficheros) gracias al soporte declarado de function calling.
- **Razonamiento paso a paso en local:** uso del thinking mode con `temperature=0.6`, `top_p=0.95`, `top_k=20` para tareas que requieren descomposición explícita de problemas, sin depender de servicios en la nube.
- **Generación de código en entornos aislados:** despliegue en CI o entornos air-gapped mediante llama.cpp, con un fichero de 1,36 GB fácil de versionar y distribuir.
- **Procesamiento de documentos largos:** análisis de textos de hasta 40.960 tokens en una sola pasada, útil para resumen o extracción de información en local.
- **Prototipado rápido de agentes:** base para pipelines multi-paso donde el bajo coste de inferencia en CPU o GPU de consumo permite iterar sin presupuesto de API.
- **Evaluación comparativa de cuantizaciones:** uso como referencia Q4_K_M para medir degradación frente a los pesos originales en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** el fichero Q4_K_M ocupa ~1,36 GB; en inferencia se recomienda reservar al menos 2-3 GB de VRAM o RAM para pesos, caché KV y overhead del runtime, dependiendo de la longitud de contexto configurada.
- **GPU recomendadas:** cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100); el modelo es sobredimensionado para GPUs de datacenter y su uso típico es en hardware de consumo.
- **Consumer GPU:** sí, cabe holgadamente en GPUs de consumo con 4 GB o más; también puede ejecutarse en CPU.
- **Opciones de despliegue:** llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run qwen3:1.7b` o Modelfile local), y cualquier runtime compatible con GGUF.
- **Contexto por defecto en Ollama:** el Modelfile de ejemplo fija `num_ctx 8192`, inferior a los 40.960 tokens máximos del modelo; para contextos largos debe ajustarse manualmente.
- **Latencia y throughput:** no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-1.7b-gguf (esta ficha) | 1,7B | 40.960 | Apache-2.0 | GGUF Q4_K_M | Redistribución no oficial; solo inglés declarado |
| Qwen/Qwen3-1.7B (original) | 1,7B | 40.960 | Apache-2.0 | safetensors | Pesos canónicos; permite cuantizar a otros formatos |
| Otros modelos de ~1-2B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de la misma categoría (modelos de 1-2B en GGUF) no puede completarse con datos verificados a partir de la información disponible; se recomienda consultar las fichas oficiales de cada modelo antes de decidir.

## Limitaciones y advertencias

- **Redistribución no oficial:** el repositorio no está afiliado, respaldado ni mantenido por Qwen, Alibaba u Ollama; para los ficheros canónicos debe acudirse a los repositorios oficiales.
- **Idioma:** la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- **Cuantización única:** solo se ofrece Q4_K_M; no hay variantes Q8_0, Q5_K_M ni ficheros sin cuantizar en este repositorio, lo que limita los experimentos de precisión.
- **Contexto efectivo en Ollama:** el Modelfile de ejemplo limita `num_ctx` a 8192, muy por debajo de los 40.960 tokens máximos; en producción debe configurarse explícitamente.
- **Alucinación:** la propia model card advierte de que el modelo puede generar contenido inexacto o dañino; requiere evaluación previa a su despliegue.
- **Sesgos:** no se documentan sesgos específicos en la información proporcionada; al ser un modelo entrenado por terceros, hereda los sesgos del modelo base.
- **Licencia:** Apache-2.0 permite uso comercial, pero las obligaciones de atribución y avisos de copyright corresponden al equipo Qwen; debe conservarse el fichero `LICENSE`.
- **Soporte:** al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de mantenimiento activo ni de comunidad que reporte problemas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timdedid/qwen3-1.7b-gguf
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-1.7B
- Etiqueta en Ollama: https://ollama.com/library/qwen3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
