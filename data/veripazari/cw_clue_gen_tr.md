# veripazari/CW_Clue_Gen_tr

## Resumen

CW_Clue_Gen_tr es un repositorio de codigo y recursos asociado al articulo "A Turkish Crossword Clue Generator" (arXiv:2405.07035), centrado en la generacion automatica de pistas de crucigrama en turco mediante modelos de lenguaje. El trabajo original lo desarrollo Kamyar Zeinalipour y esta archivado en Hugging Face por VeriPazari con el objetivo de preservar la documentacion original para la comunidad de IA en turco. No se trata de un modelo de pesos propio, sino de un proyecto que documenta el ajuste fino de modelos Llama-2 (7B y 13B chat) sobre el conjunto de datos T4TAC para generar pistas contextualizadas.

El proyecto aborda un problema concreto: la escasez de herramientas educativas en turco que combinen generacion de lenguaje natural con contenido pedagogico. Para ello, el autor construye dos corpus: TAC, con mas de 180.000 pares respuesta-pista, y T4TAC, con mas de 35.000 muestras de texto, respuesta, categoria y pista. Sobre T4TAC se ajustan los adaptadores de Llama-2-7b-chat y Llama-2-13b-chat, y se compara su rendimiento con GPT-3.5-Turbo mediante evaluacion automatica (ROUGE) y juicio humano de hablantes nativos de turco.

La relevancia actual del recurso es fundamentalmente documental y de investigacion: ofrece un caso de estudio reproducible de ajuste fino de bajo rango (PEFT/LoRA) sobre Llama-2 para una tarea educativa en un idioma de recursos limitados, junto con los datasets y el codigo de generacion de crucigramas. El repositorio de Hugging Face tiene 0 GB de tamano, 0 descargas y 0 likes, y no expone pipeline ni pesos en formato safetensors o GGUF; los adaptadores reales residen en repositorios separados del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino (PEFT/LoRA) sobre Llama-2-7b-chat y Llama-2-13b-chat (transformer decoder-only) |
| Parametros totales | 7B y 13B (segun la variante del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-2, no documentada en el repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | MIT (repositorio); los datasets se rigen por la "A Turkish Crossword Clue Generator Research License" |
| Formato de pesos | no disponible (el repositorio no contiene pesos; los adaptadores estan en repositorios separados) |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo desde cero, sino que aplica ajuste fino parametrizado eficiente (PEFT, con la libreria `peft`) sobre Llama-2-7b-chat-hf y Llama-2-13b-chat-hf. La tarea consiste en, dada una respuesta (y opcionalmente un texto y una categoria), generar una pista de crucigrama en turco. El entrenamiento se realiza sobre el dataset T4TAC, que contiene mas de 35.000 muestras con campos de texto, respuesta, categoria y pista. El dataset TAC, con mas de 180.000 pares respuesta-pista, se emplea como recurso complementario para la generacion de pistas contextualmente relevantes.

La documentacion indica que las versiones base de Llama-2 mostraban limitaciones iniciales con el turco y que el ajuste fino sobre T4TAC mejoro significativamente su rendimiento. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion combina metricas automaticas (ROUGE frente a pistas de referencia y frente a GPT-4) con evaluacion humana por hablantes nativos de turco para verificar precision linguistica y cultural.

## Capacidades

- Generacion de pistas de crucigrama en turco a partir de una respuesta dada.
- Generacion de pistas contextualizadas a partir de un texto, una respuesta y una categoria (dataset T4TAC).
- Generacion de crucigramas completos de forma dinamica mediante el codigo del repositorio.
- Capacidad de inyectar pistas personalizadas por parte de educadores para objetivos de aprendizaje concretos.
- Soporte de dos variantes de tamano (7B y 13B) para equilibrar coste y calidad.
- Capacidades multilingues limitadas al turco en el ajuste fino, aunque el modelo base Llama-2 tiene cobertura multilingue general.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de material didactico de vocabulario: un profesor introduce una lista de terminos de una unidad y el modelo genera pistas en turco para cada respuesta, produciendo un crucigrama listo para imprimir o proyectar en clase.
- Refuerzo de memoria y retencion: el sistema permite crear crucigramas tematicos por asignatura (historia, ciencias, lengua) usando el dataset T4TAC para generar pistas coherentes con el texto de estudio.
- Evaluacion formativa: el educador inyecta pistas personalizadas para alinear el crucigrama con los objetivos curriculares concretos, y usa el resultado como actividad de repaso sin coste de preparacion manual.
- Investigacion en NLP para turco: el repositorio y los datasets TAC y T4TAC sirven como base reproducible para estudiar ajuste fino PEFT en un idioma de recursos limitados.
- Generacion de contenido editorial: medios o plataformas de pasatiempos pueden usar el pipeline para producir pistas de crucigrama en turco a escala, con revision humana posterior.
- Prototipado de asistentes educativos: el codigo de generacion de pistas puede integrarse en una aplicacion de aprendizaje de idiomas o de refuerzo escolar que construya ejercicios interactivos bajo demanda.
- Benchmarking de LLMs en turco: los adaptadores y las metricas ROUGE descritas permiten comparar modelos base frente a versiones ajustadas en una tarea linguistica concreta.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, ROUGE) en la informacion disponible. La model card menciona evaluacion automatica con ROUGE frente a GPT-4 y evaluacion humana por hablantes nativos, y remite a las figuras 2 y 3 del repositorio de GitHub, pero no incluye los valores en texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un modelo Llama-2-7B en FP16 requiere aproximadamente 14 GB de VRAM y un Llama-2-13B en FP16 alrededor de 26 GB; estas cifras son estimaciones genericas para el modelo base, no datos publicados del proyecto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para las variantes de 7B y 13B se suelen emplear A100, H100 o RTX 4090/A6000, pero el proyecto no documenta requisitos.
- Compatibilidad con GPU de consumo: no documentada. Un 7B cuantizado podria caber en GPUs de consumo, pero no hay datos del autor al respecto.
- Opciones de despliegue: el repositorio cita PyTorch, Transformers y PEFT; no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CW_Clue_Gen_tr (Llama-2-7B/13B + LoRA) | 7B / 13B | no disponible | Generacion de pistas de crucigrama en turco | MIT (repo); datasets con licencia de investigacion | Repositorio de codigo y adaptadores en HF |
| GPT-3.5-Turbo | no disponible | no disponible | Generacion de pistas de crucigrama en turco (evaluado en el paper) | Propietaria | API de OpenAI |
| Llama-2-7b-chat-hf (base) | 7B | no disponible | Generacion de texto general | Llama 2 Community License | Pesos publicos en HF |
| Llama-2-13b-chat-hf (base) | 13B | no disponible | Generacion de texto general | Llama 2 Community License | Pesos publicos en HF |

La comparativa se limita a los modelos evaluados en el propio articulo; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0 GB); es un archivo de documentacion y codigo, no un modelo listo para inferencia directa.
- El ajuste fino esta orientado exclusivamente al turco; el rendimiento en otros idiomas no esta documentado.
- Los datasets TAC y T4TAC se rigen por la "A Turkish Crossword Clue Generator Research License", distinta de la licencia MIT del repositorio; es necesario revisar las condiciones antes de uso comercial.
- Riesgo de alucinacion inherente a los modelos Llama-2: las pistas generadas pueden ser linguisticamente plausibles pero incorrectas o culturalmente inadecuadas, por lo que se recomienda revision humana.
- La evaluacion humana se realizo con hablantes nativos, pero no se documentan sesgos especificos ni analisis de sesgo en la informacion disponible.
- No se especifican la longitud de contexto efectiva, los tipos de cuantizacion soportados ni el formato de pesos de los adaptadores.
- El proyecto esta archivado por un tercero (VeriPazari); la version mantenida y los adaptadores originales residen en los repositorios de Kamyar Zeinalipour.
- No hay datos de latencia, throughput ni requisitos de hardware publicados, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/CW_Clue_Gen_tr
- Repositorio original en GitHub: https://github.com/KamyarZeinalipour/CW_Clue_Gen_tr
- Articulo (arXiv): https://arxiv.org/abs/2405.07035
- Coleccion Turkish Educational Crosswords: https://huggingface.co/collections/Kamyar-zeinalipour/turkish-educational-crosswords-aied-2024-6af4852ff9a91556f58237ca
- Dataset TAC: https://huggingface.co/datasets/Kamyar-zeinalipour/TAC
- Dataset T4TAC: https://huggingface.co/datasets/Kamyar-zeinalipour/T4TAC
- Adaptador Llama-2-7B: https://huggingface.co/Kamyar-zeinalipour/llama7B_turkish_crossword_clue_gen
- Adaptador Llama-2-13B: https://huggingface.co/Kamyar-zeinalipour/llama13B_turkish_crossword_clue_gen
- Plataforma VeriPazari: https://veripazari.com.tr
