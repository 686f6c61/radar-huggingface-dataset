# XH0323/DeepSeek-V3.1

## Resumen

DeepSeek-V3.1 es un modelo de lenguaje de gran escala desarrollado por DeepSeek AI, publicado como checkpoint de chat sobre DeepSeek-V3.1-Base. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 671.000 millones de parámetros totales y 37.000 millones activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Su principal innovación es un modo híbrido que combina razonamiento extendido (thinking mode) y respuesta directa (non-thinking mode) en un único modelo, seleccionable mediante la plantilla de chat.

El modelo amplía el contexto hasta 128.000 tokens mediante una extensión en dos fases (32K y 128K) sobre el checkpoint base original de V3, con un aumento significativo de tokens de entrenamiento en ambas fases. Además, incorpora entrenamiento con formato de datos FP8 con escalas UE8M0 en pesos y activaciones, pensado para compatibilidad con formatos de microscaling y con el kernel DeepGEMM.

La relevancia actual de V3.1 radica en su mejora del soporte de tool calling y tareas de agente tras el post-entrenamiento, así como en una mayor eficiencia de razonamiento: según la model card, DeepSeek-V3.1-Think alcanza calidad de respuesta comparable a DeepSeek-R1-0528 con menor latencia. La ficha que se describe aquí corresponde a la réplica publicada por el usuario XH0323 en Hugging Face, con licencia MIT y pesos en safetensors/FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención multi-cabeza latente (MLA), según la familia DeepSeek-V3 |
| Parametros totales | 671.000 millones (684.489.845.504 según safetensors del repo) |
| Parametros activos | 37.000 millones |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP8 (UE8M0 scale data format en pesos y activaciones); no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 688,6 GB), librería transformers, código custom (`deepseek_v3`) |

## Arquitectura y entrenamiento

DeepSeek-V3.1 se basa en la arquitectura DeepSeek-V3, un transformer con capas MoE y atención multi-cabeza latente (MLA), con 671B parámetros totales y 37B activos. El checkpoint de chat se obtiene por post-entrenamiento sobre DeepSeek-V3.1-Base, que a su vez extiende el contexto del V3 base original mediante un enfoque de dos fases: una fase de extensión a 32K tokens ampliada 10 veces hasta 630B tokens, y una fase de extensión a 128K ampliada 3,3 veces hasta 209B tokens. Se recopilaron documentos largos adicionales para nutrir estas fases.

El post-entrenamiento incluye optimizaciones específicas para tool calling y tareas de agente, lo que según la model card mejora de forma significativa el rendimiento en uso de herramientas. El modelo se entrenó con formato de datos FP8 con escalas UE8M0 tanto en pesos como en activaciones, para compatibilidad con formatos de microscaling tipo MXFP8; el kernel de referencia es DeepGEMM. No se detallan en la información proporcionada los volúmenes exactos de datos de RLHF/DPO ni la composición del dataset de post-entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Modo híbrido de razonamiento: thinking mode (cadena de pensamiento extendida, estilo R1) y non-thinking mode (respuesta directa), seleccionable mediante la plantilla de chat.
- Razonamiento complejo y matemáticas en thinking mode, con calidad declarada comparable a DeepSeek-R1-0528 y menor latencia.
- Tool calling / function calling en non-thinking mode, con formato específico definido en la plantilla de chat.
- Tareas de agente y razonamiento multi-paso, mejoradas mediante post-entrenamiento.
- Generación de código (capacidad esperada por la familia V3, aunque no se detalla explícitamente en la información disponible).
- Capacidades multilingües: no disponible el listado concreto de idiomas.

## Casos de uso

- Asistentes de razonamiento profundo: activando thinking mode, el modelo puede abordar problemas matemáticos, lógicos o de planificación que requieren cadenas de pensamiento largas, con la ventaja de que el mismo checkpoint puede responder en modo directo cuando no se necesita razonamiento extendido.
- Atención al cliente automatizada: con 128K tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial extenso, documentación de producto y políticas internas incluidas en el prompt sin truncamientos frecuentes.
- Agentes con uso de herramientas: el soporte nativo de tool calling en non-thinking mode permite integrar el modelo en pipelines que consultan APIs, bases de datos o servicios externos, con formato de herramientas definido en la plantilla de chat.
- Generación y revisión de código en producción: integrable en pipelines de CI/CD para revisión de parches, generación de tests o explicación de errores, aprovechando el contexto largo para incluir repositorios o fragmentos extensos.
- Análisis de documentos largos: informes, contratos o expedientes de hasta 128K tokens pueden procesarse en una sola pasada para extracción de entidades, resumen o preguntas y respuestas sobre el contenido.
- Investigación asistida: combinación de thinking mode para formular hipótesis y non-thinking mode para redactar respuestas finales, útil en flujos de revisión bibliográfica o generación de informes técnicos.
- Automatización de soporte interno: despliegue como backend de asistentes corporativos que requieren invocar herramientas internas (ERP, ticketing, wikis) mediante function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 688,6 GB (tamaño del repo), por lo que se requiere un nodo multi-GPU; no cabe en una sola GPU convencional.
- GPU recomendadas: clústeres con múltiples H100 (80 GB) o A100 (80 GB); el despliegue típico de un modelo de 671B en FP8 requiere del orden de 8-16 GPUs de 80 GB según paralelismo y overhead.
- GPU de consumo: no es viable en RTX 4090 ni en GPUs consumer individuales; requeriría cuantizaciones agresivas (no publicadas en la información disponible) y aun así no cabría en una sola tarjeta.
- Opciones de despliegue: transformers con código custom (`deepseek_v3`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; el uso de vLLM, llama.cpp u Ollama no se confirma en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V3.1 (esta ficha) | 671B / 37B | 128K | MIT | Hugging Face, ModelScope |
| DeepSeek-V3.1-Base | 671B / 37B | 128K | MIT | Hugging Face, ModelScope |
| DeepSeek-R1-0528 | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el checkpoint base de la misma familia y con la referencia cualitativa a DeepSeek-R1-0528 en la model card; no se dispone de datos de benchmarks ni de especificaciones completas de alternativas para una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos web a gran escala, es esperable que herede sesgos de esos datos.
- Riesgo de alucinación: no se cuantifica en la información disponible; el modo thinking puede reducir errores en tareas de razonamiento, pero no los elimina.
- Limitaciones de contexto o idioma: el contexto máximo es de 128K tokens; el listado de idiomas soportados no está disponible, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, pero debe verificarse la procedencia de los pesos y el cumplimiento de las condiciones del modelo base original de DeepSeek.
- Caveats para producción: el repo es una réplica publicada por un tercero (XH0323) con 0 descargas y 0 likes, creada el 2026-11-13; conviene validar la integridad de los pesos frente al repo oficial de DeepSeek antes de desplegar. El tamaño de 688,6 GB y el requisito de FP8 con soporte de DeepGEMM implican infraestructura especializada. El tool calling solo está soportado en non-thinking mode según la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/XH0323/DeepSeek-V3.1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base
- Modelo oficial DeepSeek-V3.1: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- ModelScope (base): https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1-Base
- ModelScope (chat): https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1
- DeepGEMM: https://github.com/deepseek-ai/DeepGEMM
- Paper de referencia (arXiv 2412.19437): https://arxiv.org/abs/2412.19437
- Chat oficial: https://chat.deepseek.com/
- Organización DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
