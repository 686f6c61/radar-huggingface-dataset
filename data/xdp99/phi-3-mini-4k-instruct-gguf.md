# Xdp99/Phi-3-mini-4k-instruct-gguf

## Resumen

Phi-3-mini-4k-instruct-gguf es la distribucion en formato GGUF del modelo Phi-3-mini-4k-instruct desarrollado originalmente por Microsoft. Se trata de un modelo de lenguaje de 3.821.079.552 parametros (aproximadamente 3.8B) disenado para entornos con recursos limitados, escenarios con restricciones de latencia y tareas que requieren razonamiento denso, especialmente en matematicas y logica. Esta publicacion concreta, alojada por el usuario Xdp99, replica los ficheros GGUF del repositorio oficial de Microsoft bajo licencia MIT.

El modelo emplea una arquitectura transformer densa con una longitud de contexto de 4096 tokens (variante 4K de la familia Phi-3). Ha sido entrenado con los datasets Phi-3, que combinan datos sinteticos y datos filtrados de sitios web publicos, con enfasis en calidad y densidad de razonamiento. El post-entrenamiento incorpora ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO) para mejorar la adherencia a instrucciones y las medidas de seguridad.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que reducen el peso a 2.2 GB en Q4_K_M. Esto lo convierte en una opcion practica para prototipado local, despliegue en el borde y aplicaciones de inferencia con presupuesto de memoria ajustado, aunque limitado al idioma ingles segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3) |
| Parametros totales | 3.821.079.552 (aproximadamente 3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (variante 4K) |
| Tipos de cuantizacion | Q4_K_M (4 bits) y FP16 (16 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 3.8B parametros perteneciente a la familia Phi-3 de Microsoft. La variante aqui distribuida corresponde a la version de 4K tokens de contexto, frente a la variante de 128K de la misma familia. El entrenamiento utiliza los datasets Phi-3, que combinan datos sinteticos generados y datos filtrados de sitios web publicos, con un enfoque explicito en alta calidad y densidad de razonamiento. El proceso de post-entrenamiento incluye ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO), orientados a mejorar la adherencia a instrucciones y las salvaguardas de seguridad.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. El formato de chat recomendado sigue la plantilla `<|user|>\nQuestion <|end|>\n<|assistant|>`, y el modelo esta optimizado para prompts conversacionales y escenarios few-shot segun la documentacion del autor original.

## Capacidades

- Generacion de texto conversacional con formato de chat estructurado mediante tokens especiales `<|user|>`, `<|end|>` y `<|assistant|>`.
- Razonamiento logico y matematico, con enfasis declarado en tareas de razonamiento denso.
- Generacion y comprension de codigo, segun los tags del repositorio (`code`) y la evaluacion en benchmarks de codigo mencionada en la model card.
- Comprension del lenguaje natural y sentido comun, evaluado en benchmarks de la model card.
- Soporte de prompts few-shot y multi-turno segun la plantilla documentada.
- Capacidad de contexto largo dentro de la ventana de 4096 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Asistencia conversacional local en ingles: el modelo puede gestionar dialogos multi-turno dentro de su ventana de 4096 tokens, con un peso de 2.2 GB en Q4_K_M que permite ejecutarlo en portatiles y equipos sin GPU dedicada mediante Ollama o llama.cpp.
- Prototipado rapido de aplicaciones de IA generativa: al estar en formato GGUF y licencia MIT, sirve como base para validar prompts, plantillas de chat y flujos conversacionales antes de migrar a modelos mayores en produccion.
- Razonamiento matematico y logico en entornos con recursos limitados: la model card lo orienta explicitamente a escenarios con restricciones de memoria y computo donde se requiere razonamiento denso, como tutoria educativa o resolucion de problemas paso a paso.
- Generacion de codigo en herramientas de desarrollo local: puede integrarse en editores o asistentes de linea de comandos que ejecuten inferencia en el dispositivo, aprovechando la cuantizacion Q4_K_M para mantener latencia baja.
- Despliegue en el borde (edge computing): su tamano reducido y la disponibilidad de FP16 (7.2 GB) y Q4_K_M (2.2 GB) permiten ejecutarlo en dispositivos con memoria limitada, como mini-PCs o sistemas embebidos con suficiente RAM.
- Filtrado y clasificacion de texto en pipelines de NLP: puede emplearse para tareas de resumen, extraccion de informacion o clasificacion en ingles dentro de flujos automatizados, con la ventaja de no requerir GPU de datacenter.
- Base para investigacion en modelos pequenos: util para experimentos de ajuste fino o evaluacion comparativa de tecnicas de cuantizacion, dado su tamano manejable y su licencia permisiva MIT.

## Benchmarks y rendimiento

La model card indica que Phi-3 Mini-4K-Instruct muestra un rendimiento "robusto y de vanguardia entre modelos de menos de 13 mil millones de parametros" en benchmarks de sentido comun, comprension del lenguaje, matematicas, codigo, contexto largo y razonamiento logico. Sin embargo, no se proporcionan cifras numericas concretas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2.2 GB en cuantizacion Q4_K_M y aproximadamente 7.2 GB en FP16, segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores en FP16; en Q4_K_M puede ejecutarse en GPUs con 4 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer actuales, especialmente con la cuantizacion Q4_K_M. Tambien puede ejecutarse en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama (con `ollama run phi3` o mediante Modelfile personalizado), y cualquier runtime compatible con GGUF. La model card documenta explicitamente el flujo con Ollama y la descarga via Hugging Face CLI. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct-gguf (esta ficha) | aproximadamente 3.8B | 4096 | MIT | GGUF | Variante 4K, solo ingles |
| Phi-3-mini-128k-instruct | aproximadamente 3.8B | 131072 | MIT | safetensors/GGUF/ONNX | Variante de contexto largo de la misma familia |
| Phi-3-mini-4k-instruct (original Microsoft) | aproximadamente 3.8B | 4096 | MIT | safetensors/ONNX | Peso original sin cuantizar |

La model card referencia las variantes 4K y 128K de la familia Phi-3 Mini, asi como las versiones ONNX. No se proporcionan datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta disenado y evaluado principalmente para ingles; el campo `language` solo declara `en`. El rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto limitado: la variante 4K restringe la ventana a 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas; para esos casos existe la variante 128K de la misma familia.
- Sesgos: la model card advierte que los modelos no estan disenados ni evaluados para todos los propositos downstream, y que los desarrolladores deben evaluar y mitigar precision, seguridad y equidad antes de usos de alto riesgo.
- Alucinacion: no se documentan medidas especificas contra alucinaciones mas alla del post-entrenamiento con SFT y DPO; como todo modelo de lenguaje, puede generar contenido factualmente incorrecto.
- Licencia: MIT, permisiva para uso comercial, pero la model card aclara que nada en ella debe interpretarse como restriccion o modificacion de la licencia.
- Repositorio de terceros: esta publicacion (Xdp99) replica ficheros GGUF del repositorio oficial de Microsoft; conviene verificar la integridad de los ficheros frente al repositorio original antes de usarlos en produccion.
- Sin soporte documentado de tool calling ni agentes: no se mencionan capacidades de function calling o razonamiento multi-paso con herramientas en la informacion disponible.
- Fecha de creacion del repositorio: 2026-11-10, con cero descargas y cero likes en el momento de la consulta, lo que indica nula validacion comunitaria de esta copia concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xdp99/Phi-3-mini-4k-instruct-gguf
- Repositorio oficial Microsoft Phi-3-mini-4k-instruct: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Repositorio oficial GGUF Microsoft: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
- Variante 128K: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Blog de Microsoft Phi-3: https://aka.ms/phi3blog-april
- Informe tecnico Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 en Hugging Face: https://aka.ms/phi3-hf
- Phi-3 ONNX 4K: https://aka.ms/phi3-mini-4k-instruct-onnx
- Phi-3 ONNX 128K: https://aka.ms/phi3-mini-128k-instruct-onnx
- Licencia MIT: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/LICENSE
- Ollama: https://ollama.com/install.sh
