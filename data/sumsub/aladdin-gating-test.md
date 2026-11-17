# Sumsub/aladdin-gating-test

## Resumen

Aladdin-gating-test es un modelo publicado en Hugging Face por Sumsub, empresa especializada en verificacion de identidad. Se trata de un fine-tuning del modelo de generacion de imagenes FLUX.1-Krea-dev de Black Forest Labs, orientado a tareas de face-swapping (intercambio de rostros). El repositorio lleva las etiquetas `face-swapping`, `research-only` y la referencia a un paper con identificador arXiv:2610.37503, aunque no se ha podido verificar el contenido de dicha publicacion a partir de la informacion disponible.

El modelo se distribuye bajo una licencia propia denominada `aladdin-license` y con acceso restringido (gated): es necesario aceptar condiciones adicionales en Hugging Face antes de poder descargar los pesos. Esta restriccion, junto con la etiqueta `research-only`, sugiere que el uso previsto es la investigacion y no la produccion comercial sin autorizacion explicita.

La relevancia del modelo radica en su especializacion: en lugar de ser un generador de imagenes de proposito general, parte de FLUX.1-Krea-dev y se ajusta para una tarea concreta de manipulacion facial. No obstante, la informacion publica disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas, no hay descargas ni likes, y no se han publicado resultados de benchmarks en la informacion consultada. Esta ficha refleja, por tanto, unicamente los datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de FLUX.1-Krea-dev, modelo de difusion para generacion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | aladdin-license (acceso restringido, etiqueta research-only) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `black-forest-labs/FLUX.1-Krea-dev`, segun los metadatos del repositorio. FLUX.1-Krea-dev es un modelo de difusion para generacion de imagenes de Black Forest Labs; al tratarse de un derivado, la arquitectura subyacente corresponde a un transformer de difusion con codificadores de texto e imagen, aunque no se detallan en la informacion proporcionada los detalles exactos de la variante Krea.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas especificas del fine-tuning. La etiqueta `face-swapping` indica la tarea objetivo, y la referencia `arxiv:2610.37503` apunta a un paper asociado, pero su contenido no esta disponible en la busqueda realizada.

## Capacidades

- Intercambio de rostros (face-swapping) en imagenes, segun la etiqueta del repositorio.
- Generacion y edicion de imagenes heredadas del modelo base FLUX.1-Krea-dev (capacidad inferida por la relacion de fine-tuning, no documentada explicitamente).
- No se ha documentado soporte de tool calling, function calling ni agentes.
- No se ha documentado capacidad multilingue ni de texto.
- No se ha documentado modo de razonamiento (thinking mode), vision, audio ni otras capacidades especiales.
- Uso declarado como exclusivamente de investigacion (`research-only`).

## Casos de uso

- Investigacion en sintesis facial: el modelo puede emplearse en experimentos academicos sobre generacion e intercambio de rostros, dado su caracter `research-only` y la referencia a un paper.
- Estudio de deteccion de deepfakes: disponer de un modelo de face-swapping permite generar conjuntos de datos controlados para entrenar y evaluar detectores de manipulacion facial.
- Evaluacion de robustez de sistemas de verificacion de identidad: Sumsub opera en verificacion de identidad, por lo que el modelo puede servir para probar la resistencia de sus pipelines frente a ataques de suplantacion.
- Analisis de sesgos en generacion facial: al partir de FLUX.1-Krea-dev, se puede estudiar como el fine-tuning afecta a la representacion de distintos grupos demograficos.
- Prototipado de herramientas de edicion creativa: en entornos controlados de investigacion, para explorar tecnicas de transferencia de identidad en imagen.
- Reproducibilidad de resultados: al estar asociado a un paper, permite a otros investigadores replicar los experimentos descritos, siempre que acepten las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al derivar de FLUX.1-Krea-dev, es previsible que requiera una GPU con memoria suficiente para modelos de difusion de gran tamano, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al ser un modelo de imagen, las herramientas habituales de LLM no aplican directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sumsub/aladdin-gating-test | no disponible | no aplica | face-swapping (fine-tuning de FLUX.1-Krea-dev) | aladdin-license, research-only, gated | Hugging Face, acceso restringido |
| black-forest-labs/FLUX.1-Krea-dev | no disponible en la informacion | no aplica | generacion de imagenes | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de face-swapping | no disponible | no disponible | face-swapping | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otros modelos de face-swapping.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable libremente.
- Licencia `aladdin-license` con etiqueta `research-only`: el uso comercial esta sujeto a condiciones no detalladas en la informacion disponible.
- Riesgo elevado de uso malintencionado: la tecnologia de face-swapping puede emplearse para suplantacion de identidad, desinformacion o fraude; la restriccion de acceso parece orientada a mitigarlo.
- Sesgos conocidos: no documentados, pero heredables del modelo base FLUX.1-Krea-dev y del dataset de fine-tuning, no especificado.
- Riesgo de alucinacion visual: no documentado; en modelos de difusion se manifiesta como artefactos o inconsistencias en la imagen generada.
- Limitaciones de idioma: no aplica directamente al ser un modelo de imagen, pero el codificador de texto del modelo base podria condicionar el rendimiento en prompts no ingleses.
- Ausencia de benchmarks: no hay evidencia publica de calidad o fidelidad del face-swapping.
- Caveat para produccion: no se recomienda su uso en produccion sin una evaluacion independiente y sin aclarar los terminos exactos de la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sumsub/aladdin-gating-test
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-Krea-dev
- Referencia al paper: arXiv:2610.37503 (no verificable en la busqueda realizada)
- Sitio web de Sumsub: https://sumsub.com/
- Documentacion de Sumsub: https://docs.sumsub.com/
