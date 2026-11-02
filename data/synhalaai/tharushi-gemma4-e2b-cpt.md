# SynhalaAI/Tharushi-Gemma4-E2B-CPT

## Resumen

Tharushi-Gemma4-E2B-CPT es un ajuste fino (continual pre-training, segun el sufijo CPT del nombre) del modelo unsloth/gemma-4-E2B-it-unsloth-bnb-4bit, publicado por el usuario SynhalaAI en HuggingFace. El modelo base pertenece a la familia Gemma 4 de Google, en su variante E2B (orientada a eficiencia), y el ajuste anade soporte para ingles y cingales (si), ademas de mantener la modalidad image-text-to-text heredada del modelo original.

El repositorio declara 5.123.178.051 parametros en formato safetensors y un tamano de 30,6 GB, lo que sugiere pesos en precision alta a pesar de que el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit). El pipeline es image-text-to-text, por lo que conserva capacidad de procesamiento de imagenes ademas de generacion de texto. La ficha tecnica oficial del autor no esta disponible en la informacion proporcionada, y el modelo esta sujeto a acceso restringido (gated) en HuggingFace.

La relevancia de este modelo es limitada pero concreta: se trata de un experimento de adaptacion linguistica de un modelo Gemma 4 pequeno a un idioma de bajos recursos como el cingales, con cero descargas y cero likes en el momento de la consulta. No dispone de licencia declarada, lo que supone un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo base de partida en bnb-4bit; pesos publicados en safetensors) |
| Idiomas soportados | en, si |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text |
| Modelo base | unsloth/gemma-4-E2B-it-unsloth-bnb-4bit |
| Acceso | restringido (gated) |
| Tamano del repositorio | 30,6 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por el nombre y el modelo base, se trata de una variante de la familia Gemma 4 de Google en su version E2B, orientada a eficiencia, con capacidad multimodal image-text-to-text. El modelo de partida es la version instruct ajustada por Unsloth y cuantizada en 4 bits (bnb-4bit), lo que indica que el punto de partida ya habia pasado por un proceso de instruccion y cuantizacion.

El sufijo CPT sugiere un proceso de continual pre-training sobre el modelo base, presumiblemente para adaptarlo al cingales y reforzar el ingles. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). Los tags incluyen `unsloth`, lo que apunta a que el ajuste se realizo con las herramientas de Unsloth, pero no se confirma en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text).
- Soporte multilingue limitado a ingles y cingales.
- Capacidad de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- Compatibilidad con text-generation-inference (tag `text-generation-inference`).
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistencia conversacional en cingales: el modelo puede mantener dialogos multi-turno en cingales e ingles, adecuado para aplicaciones de atencion al usuario en Sri Lanka o comunidades diaspora, aunque la calidad real no esta validada por benchmarks publicos.
- Procesamiento de documentos con imagenes en cingales: al conservar la modalidad image-text-to-text, puede emplearse para extraer o describir contenido de imagenes acompanadas de texto en entornos bilingues ingles-cingales.
- Prototipado de investigación en adaptacion linguistica: util como punto de partida para estudiar el efecto del continual pre-training sobre un modelo Gemma 4 pequeno en un idioma de bajos recursos.
- Traduccion asistida ingles-cingales: uso como componente en pipelines de traduccion o post-edicion, con validacion humana obligatoria dada la ausencia de benchmarks.
- Generacion de contenido educativo en cingales: redaccion de material divulgativo o ejercicios, con revision por hablantes nativos.
- Experimentacion con modelos multimodales pequenos: el tamano de 5,1 mil millones de parametros permite desplegarlo en hardware modesto para pruebas de concepto de vision-lenguaje en un idioma poco cubierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 10-11 GB solo para pesos (5,1 mil millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 3-4 GB para pesos, mas overhead.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para FP16 sin cuantizar; GPUs consumer con 8-12 GB para versiones cuantizadas.
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM si se cuantiza; en FP16 requiere 12 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints de HuggingFace; no se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| SynhalaAI/Tharushi-Gemma4-E2B-CPT | 5,1 B | no disponible | en, si | no disponible | restringido |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 E2B (familia original de Google) | variante E2B | no disponible | multilingue | no disponible en esta ficha | no disponible |

La comparativa se limita al modelo base y a la familia de origen, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de la calidad del ajuste ni de la mejora en cingales.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo esta sujeto a acceso restringido en HuggingFace, lo que anade una capa de condiciones.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- Riesgo de alucinacion y de degradacion del rendimiento en ingles tras el continual pre-training, sin datos que lo cuantifiquen.
- Cobertura linguistica limitada a ingles y cingales; el resto de idiomas no esta soportado segun los tags.
- Longitud de contexto desconocida, lo que impide garantizar conversaciones o documentos largos.
- El modelo base de partida estaba cuantizado en 4 bits, mientras que los pesos publicados ocupan 30,6 GB en safetensors; conviene verificar la coherencia de precision antes de desplegar.
- Sin documentacion sobre sesgos, datos de entrenamiento ni procesos de alineacion.

## Enlaces

- HuggingFace: https://huggingface.co/SynhalaAI/Tharushi-Gemma4-E2B-CPT
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
