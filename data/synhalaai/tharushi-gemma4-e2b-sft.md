# SynhalaAI/Tharushi-Gemma4-E2B-SFT

## Resumen

Tharushi-Gemma4-E2B-SFT es un ajuste fino supervisado (SFT) del modelo Gemma 4 E2B en su variante instruction-tuned, publicado por SynhalaAI. El modelo parte de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una version cuantizada en 4 bits del checkpoint oficial de Google preparada por Unsloth para facilitar el entrenamiento eficiente en memoria. El ajuste se ha realizado con la libreria Unsloth y se distribuye en formato transformers con pesos safetensors.

El pipeline declarado es `image-text-to-text`, lo que indica que el modelo conserva la capacidad multimodal (vision-lenguaje) heredada de la familia Gemma 4, ademas de generacion de texto conversacional. Los idiomas declarados son ingles (en) y cingales (si), lo que sugiere que el ajuste fino se ha orientado a mejorar el rendimiento en cingales, un idioma de bajos recursos con escasa cobertura en los modelos generalistas.

El modelo es relevante por dos motivos: por un lado, demuestra el flujo de trabajo habitual de la comunidad para adaptar modelos base de Google a idiomas minoritarios mediante SFT con Unsloth; por otro, al conservar la naturaleza multimodal del checkpoint original, permite experimentar con tareas imagen-texto en cingales. El acceso esta restringido (gated) y no se especifica licencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Gemma 4 E2B; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El checkpoint base esta en bnb-4bit; el modelo publicado se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | en (ingles), si (cingales) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Gemma 4 E2B en su variante instruction-tuned, que no se detalla en la informacion proporcionada. El sufijo "E2B" sugiere una variante de eficiencia de la familia Gemma 4, pero no se confirman parametros totales ni si emplea mezcla de expertos. El checkpoint de partida es la version `unsloth-bnb-4bit`, es decir, una cuantizacion de 4 bits en formato bitsandbytes optimizada por Unsloth para reducir el consumo de VRAM durante el entrenamiento.

El entrenamiento realizado es un ajuste fino supervisado (SFT) sobre el modelo instruction-tuned, no un entrenamiento desde cero ni un proceso de RLHF/DPO declarado. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de contexto usada durante el SFT ni los hiperparametros. La herramienta empleada es Unsloth, lo que habitualmente implica LoRA o QLoRA sobre el modelo cuantizado, aunque este detalle no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruction-tuned base.
- Procesamiento imagen-texto (pipeline `image-text-to-text`), lo que permite entrada de imagenes junto a texto.
- Soporte de ingles y cingales como idiomas declarados.
- Capacidad de razonamiento y respuesta a instrucciones propia de un modelo SFT.
- Compatibilidad con text-generation-inference segun los tags del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se confirma soporte de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.
- No se confirma soporte de audio.

## Casos de uso

- Asistencia conversacional en cingales: el ajuste SFT sobre un modelo instruction-tuned permite desplegar un chatbot que responda en cingales con mayor naturalidad que el modelo base, util para atencion al usuario en Sri Lanka.
- Descripcion de imagenes en cingales: al conservar el pipeline image-text-to-text, puede emplearse para generar descripciones o resumenes de imagenes en cingales, por ejemplo en aplicaciones de accesibilidad.
- Traduccion asistida ingles-cingales: el modelo puede servir como base para tareas de traduccion o parafraseo entre ambos idiomas declarados, con validacion humana posterior.
- Prototipado rapido de asistentes multimodales: su tamano reducido (repo de 0,3 GB) y su origen en un checkpoint de 4 bits lo hacen adecuado para experimentar en entornos con VRAM limitada.
- Educacion y materiales didacticos: generacion de explicaciones o preguntas de practica en cingales a partir de texto o imagenes de apoyo.
- Investigacion en adaptacion linguistica: sirve como referencia para estudiar como el SFT con Unsloth afecta al rendimiento en idiomas de bajos recursos frente al modelo base.
- Extraccion de informacion de documentos escaneados: combinando entrada de imagen y texto, puede resumir o responder preguntas sobre capturas o formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al derivar de un checkpoint de 4 bits y ocupar 0,3 GB el repositorio, es probable que quepa en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es plausible su ejecucion en GPUs consumer tipo RTX 3060/4060 o superiores, sin datos oficiales.
- Cabe en GPU de consumo: probablemente si, segun el tamano del repositorio, aunque no se confirma.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Tharushi-Gemma4-E2B-SFT | no disponible | no disponible | en, si | no disponible | SFT comunitario sobre Gemma 4 E2B, gated |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | no disponible | no disponible | no disponible | no disponible | Modelo base cuantizado en 4 bits |
| Gemma 4 E2B it (oficial de Google) | no disponible | no disponible | no disponible | no disponible | Checkpoint original instruction-tuned |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a la relacion de dependencia entre el modelo y su base.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente mayor en cingales por la menor disponibilidad de datos de entrenamiento en ese idioma.
- Sesgos desconocidos: no se documenta la composicion del dataset de SFT ni posibles sesgos introducidos.
- Cobertura limitada a dos idiomas declarados (en, si); el rendimiento en otros idiomas no esta garantizado.
- No se especifican la longitud de contexto efectiva ni los hiperparametros de entrenamiento, lo que dificulta reproducir o auditar el ajuste.
- El modelo base esta cuantizado en 4 bits; la precision final del checkpoint publicado no se detalla, lo que puede afectar a la calidad frente al modelo original en precision completa.
- Sin likes ni benchmarks publicados: la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SynhalaAI/Tharushi-Gemma4-E2B-SFT
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
