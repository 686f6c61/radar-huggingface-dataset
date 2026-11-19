# virtual-human-chc/prot_xlnet

## Resumen

ProtXLNet es un modelo de lenguaje de proteínas (protein language model, PLM) basado en la arquitectura XLNet, desarrollado originalmente por Ahmed Elnaggar et al. en el marco del proyecto ProtTrans (Rostlab, Universidad Tecnica de Munich). El repositorio `virtual-human-chc/prot_xlnet` es un fork del repositorio original `Rostlab/prot_xlnet`, publicado por el usuario Maksim Pavlov bajo la misma licencia Academic Free License v3.0.

El modelo resuelve la tarea de extraccion de caracteristicas (feature extraction) sobre secuencias de aminoacidos: genera representaciones vectoriales contextuales de alta dimension utiles como entrada para tareas downstream de bioinformatica estructural y funcional, como prediccion de estructura secundaria, prediccion de contactos entre residuos, clasificacion de familias proteicas o prediccion de localizacion subcelular.

Es relevante porque los PLM preentrenados sobre grandes corpus de secuencias (UniProt, UniRef) permiten transfer learning eficiente en biologia computacional sin necesidad de reentrenar desde cero. XLNet aporta un objetivo de entrenamiento autoregresivo permutacional que captura dependencias bidireccionales, algo especialmente util en secuencias proteicas donde el contexto no tiene una direccion natural fija. El repositorio ocupa 4,9 GB y el pipeline declarado es `feature-extraction`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLNet (transformer autoregresivo permutacional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; en la practica opera sobre secuencias de aminoacidos) |
| Licencia | AFL-3.0 (Academic Free License v3.0) |
| Formato de pesos | PyTorch (compatible con `transformers`, `AutoModel`) |

## Arquitectura y entrenamiento

ProtXLNet emplea la arquitectura XLNet, un transformer que combina el modelado autoregresivo con un mecanismo de prediccion permutacional: durante el preentrenamiento se permutan aleatoriamente los factores de factorizacion de la secuencia, de modo que el modelo aprende a predecir cada token condicionado a un subconjunto arbitrario de los demas. Esto permite capturar dependencias bidireccionales sin las limitaciones del enmascaramiento tipo BERT ni la rigidez direccional de un GPT clasico.

El modelo fue preentrenado por el equipo de ProtTrans sobre grandes corpus de secuencias proteicas (UniProt y UniRef, segun la documentacion del proyecto original). La model card de este fork no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de ajuste fino supervisado o RLHF; esos datos deben consultarse en el paper original (DOI: 10.1109/TPAMI.2021.3095381). No se documentan innovaciones adicionales especificas de este fork mas alla de la redistribucion de los pesos originales.

## Capacidades

- Generacion de embeddings contextuales por residuo y por secuencia a partir de secuencias de aminoacidos.
- Extraccion de caracteristicas para tareas downstream: estructura secundaria, contactos, solubilidad, localizacion, clasificacion funcional.
- Representaciones bidireccionales gracias al objetivo permutacional de XLNet.
- Soporte de procesamiento por lotes (`padding=True`) para multiples secuencias simultaneas.
- Preprocesado documentado para aminoacidos no estandar (U, Z, O, B) mediante sustitucion por `X`.
- No soporta tool calling, function calling ni comportamiento agentico: es un modelo de representacion, no un modelo generativo conversacional.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no aplicable: opera sobre el alfabeto de aminoacidos, no sobre lenguaje natural.

## Casos de uso

- Prediccion de estructura secundaria de proteinas: se extraen los embeddings por residuo y se alimentan a un clasificador ligero (p. ej. una cabeza lineal o una CNN 1D) para predecir helices, laminas y bucles; el modelo aporta representaciones contextualizadas que reducen la necesidad de datos etiquetados.
- Prediccion de contactos entre residuos: los embeddings por par de posiciones sirven como entrada a modelos de contacto o para inicializar tecnicas de plegado; util en pipelines de prediccion estructural asistida.
- Anotacion funcional de proteinas: clasificacion de familias o funciones enzimaticas (p. ej. niveles EC) usando los embeddings de secuencia como caracteristicas en un clasificador supervisado.
- Busqueda y agrupamiento de secuencias: generar embeddings de proteina completa para similitud coseno, deduplicacion de librerias o clustering de familias proteicas en bases de datos genomicas.
- Prediccion de propiedades fisicoquimicas: solubilidad, termoestabilidad o localizacion subcelular mediante regresion sobre los embeddings extraidos.
- Filtrado y priorizacion en descubrimiento de farmacos: puntuar variantes o candidatos proteicos por su representacion aprendida antes de costosos ensayos in vitro.
- Ingenieria de proteinas: usar los embeddings como espacio latente para modelos generativos o de optimizacion dirigida de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 4,9 GB en pesos PyTorch, por lo que se requiere al menos ese orden de magnitud en memoria (mas overhead de activaciones y tokenizador).
- GPU recomendadas: no especificadas por el autor. Por el tamano del checkpoint, una GPU con 8-16 GB (RTX 3080/4080/4090, A10, L4) deberia ser suficiente para inferencia en precision completa o media; A100/H100 para lotes grandes.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas, aunque el dato no esta confirmado en la model card.
- Opciones de despliegue: `transformers` (PyTorch) con `AutoModel` y `AutoTokenizer` (con `use_fast=False`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de embeddings no encaja en el flujo habitual de esos servidores generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| ProtXLNet (este repo) | XLNet | no disponible | no disponible | feature extraction | AFL-3.0 |
| ProtBert (Rostlab) | BERT | no disponible | no disponible | feature extraction | AFL-3.0 |
| ProtAlbert (Rostlab) | ALBERT | no disponible | no disponible | feature extraction | AFL-3.0 |
| ESM-2 (Meta) | Transformer | 8M-15B (segun variante) | hasta 1024 aa | embeddings / plegado | MIT (segun variante) |

Los datos de parametros y contexto de ProtBert, ProtAlbert y ESM-2 no se han verificado en la informacion proporcionada y deben consultarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Modelo de extraccion de caracteristicas: no genera texto ni respuestas; no debe usarse como chatbot ni como modelo instruct.
- Solo procesa secuencias de aminoacidos; no es multilingue en el sentido habitual, pese a la etiqueta `en` del repositorio.
- Los aminoacidos no estandar (U, Z, O, B) deben sustituirse por `X` antes de la tokenizacion, lo que puede degradar la representacion en regiones con residuos modificados.
- Riesgo de sesgo derivado de la composicion de UniProt/UniRef: infrarepresentacion de proteinas de organismos poco estudiados.
- Riesgo de alucinacion en el sentido de representaciones poco fiables para secuencias fuera de distribucion (p. ej. proteinas disenadas de novo o muy divergentes del corpus de entrenamiento).
- Licencia AFL-3.0: permite uso comercial con condiciones (atribucion, no uso del nombre del autor para promocion sin permiso, etc.); conviene revisar el texto completo antes de integrar en producto.
- Al ser un fork no oficial, no hay garantia de mantenimiento, soporte ni actualizaciones por parte del autor original; el codigo propio del fork se declara bajo licencia MIT.
- No se documentan limites de longitud de contexto ni comportamiento con secuencias muy largas; validar empiricamente antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/virtual-human-chc/prot_xlnet
- Repositorio original en Hugging Face: https://huggingface.co/Rostlab/prot_xlnet
- Repositorio GitHub de ProtTrans: https://github.com/agemagician/ProtTrans
- Paper de ProtTrans (IEEE TPAMI): https://ieeexplore.ieee.org/document/9477085
- DOI de cita: https://doi.org/10.1109/TPAMI.2021.3095381
- Texto de la licencia AFL-3.0: https://choosealicense.com/licenses/afl-3.0/
