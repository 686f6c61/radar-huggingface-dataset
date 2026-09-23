# Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI

## Resumen

Cobijada MiniMax-H3 Hybrid (Pruned, Uncensored) es un checkpoint fusionado a partir de los dos modos de condicionamiento oficiales de MiniMax H3, un transformer de difusion (DiT) conjunto de audio y video orientado a ComfyUI. El autor, Winnougan, parte del checkpoint FL (condicionamiento por primer y ultimo fotograma) como base de toda la red e injerta los pesos `adaln_proj` de los bloques 25 a 49 procedentes del checkpoint REF (condicionamiento por referencias), de modo que un solo fichero admite flujos de referencia de imagen, video y audio sin renunciar a la fidelidad de salida de FL.

El problema que resuelve es concreto: MiniMax H3 distribuye dos regímenes de entrenamiento con arquitectura y disposicion de tensores identicas, pero FL ofrece mayor calidad bruta y REF anade condicionamiento por referencias a costa de degradar la salida incluso en tareas sin referencias. La comparacion tensor a tensor de ambos checkpoints muestra que la practica totalidad de los pesos (proyecciones de atencion, MLP, normalizaciones, proyecciones de parches, embeddings rotatorios y el refinador de tokens) es identica, y que las diferencias relevantes se concentran en las proyecciones de modulacion AdaLN por bloque.

La relevancia actual es de tipo practico para el ecosistema ComfyUI: al no modificarse la arquitectura ni el layout de tensores, el hibrido se carga con el cargador estandar de MiniMax H3 y funciona como sustituto directo del checkpoint REF. Se distribuye en tres variantes (BF16, INT8 y W4A8) dentro de un repositorio de 61,2 GB, con licencia Apache 2.0 para el merge y las conversiones, si bien los pesos subyacentes de MiniMax H3 siguen sujetos a la licencia original de MiniMax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) conjunto de audio y video, con proyecciones de modulacion AdaLN por bloque (`adaln_proj`) y refinador de tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video; el condicionamiento se realiza por fotogramas clave primero/ultimo y por referencias, no por ventana de contexto de texto) |
| Tipos de cuantizacion | BF16, INT8 (ConvRot), W4A8 (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (merge, conversiones cuantizadas y repositorio); los pesos originales de MiniMax H3 quedan sujetos a la licencia propia de MiniMax |
| Formato de pesos | safetensors |
| Pipeline | image-to-video (etiquetado en HuggingFace); la model card describe generacion texto/imagen/video/audio a video |
| Modos de condicionamiento | primer/ultimo fotograma (FL) y condicionamiento por referencias (REF) en un unico checkpoint |
| Tamano del repositorio | 61,2 GB |
| Ficheros publicados | `Cobijada_H3_Hybrid_Uncensored_pruned_hybrid_BF16_pruned.safetensors`, `..._int8_convrot_pruned.safetensors`, `..._w4a8_convrot_pruned.safetensors` |
| Longitud o resolucion de video | no disponible |
| Descargas en HuggingFace | 0 |
| Fecha de creacion del repositorio | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion que procesa conjuntamente audio y video, con un refinador de tokens y modulacion AdaLN por bloque que inyecta la senal de condicionamiento en el flujo residual. La diferencia entre los dos checkpoints de origen (FL y REF) es de regimen de entrenamiento, no de topologia: ambos comparten layout de tensores, proyecciones de atencion, MLP, normalizaciones, proyecciones de parches, embeddings rotatorios y refinador de tokens. Las divergencias se localizan casi por completo en los pesos `adaln_proj` de cada bloque, que son los que canalizan el condicionamiento.

El merge es una seleccion de pesos a nivel de tensor, sin entrenamiento adicional, sin ajuste fino y sin optimizacion basada en gradientes. La base de toda la red es el checkpoint FL; los pesos `adaln_proj` de los bloques 25 a 49 (la mitad final de la red) se toman del checkpoint REF. El resto (pesos `adaln_proj` de bloques tempranos, proyeccion AdaLN final, atencion, MLPs, normalizaciones y cabezas de salida) permanece en FL. La hipotesis de diseno es que la via de condicionamiento por referencias se expresa principalmente a traves de los AdaLN de la segunda mitad de la red. Ambos checkpoints de partida eran ya las variantes "uncensored" y podadas antes de la fusion, y las versiones INT8 y W4A8 se cuantizaron a partir del hibrido BF16. No se documenta numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO para el material original.

## Capacidades

- Generacion de video a partir de texto, imagen, video o audio, con sincronizacion de audio y video en un mismo modelo.
- Condicionamiento por primer y ultimo fotograma (via FL), util para interpolacion y control de trayectoria entre dos imagenes dadas.
- Condicionamiento por referencias de imagen, video y audio (via REF), que permite fijar identidad, estilo o contenido sonoro en la generacion.
- Coexistencia de ambos regimenes en un unico checkpoint, sin nodos personalizados: el cargador estandar de MiniMax H3 sirve para los dos tipos de flujo.
- Tres niveles de precision para el mismo resultado de merge, lo que permite ajustar consumo de VRAM y calidad.
- No se documentan capacidades de tool calling, function calling, uso agentico ni razonamiento multi-paso: es un modelo generativo de difusion, no un modelo de lenguaje.
- Cobertura de idiomas: no disponible.

## Casos de uso

- Produccion de video con personaje consistente: se aporta una referencia de imagen del sujeto y el modelo mantiene su identidad a lo largo de los fotogramas, algo que el checkpoint FL por si solo no permite y que con REF obligaba a aceptar una perdida de calidad en toda la salida.
- Interpolacion y control de transiciones: usando el modo FL con primer y ultimo fotograma se pueden generar planos de transicion entre dos imagenes fijas, util en montaje y en animatica previa.
- Doblaje y sonorizacion asistida: al ser un DiT conjunto de audio y video, admite referencias de audio y permite generar video con una pista sonora coherente, aprovechable en prototipos de videoclip o en pruebas de doblaje.
- Sustitucion directa del checkpoint REF en flujos existentes de ComfyUI: cualquier grafo que hoy cargue REF puede apuntar a este hibrido sin reescribir nodos, ya que arquitectura y layout de tensores no cambian, y obtener una salida mas cercana a FL.
- Iteracion rapida en estudio pequeno con GPU de gama alta: la variante W4A8 reduce el peso en memoria respecto a BF16, lo que permite probar prompts y referencias en una sola GPU en lugar de esperar a un nodo multi-GPU.
- Generacion de material de referencia para previsualizacion: productoras y equipos de arte pueden producir clips cortos condicionados por bocetos o referencias para validar una direccion visual antes de rodar.
- Pipelines de contenido para redes o demos tecnicas: al estar integrado en ComfyUI, el modelo se inserta en cadenas con otros nodos (upscaling, interpolacion de fotogramas, postproceso) para generar piezas cortas de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP-score, IS, calidad de audio ni comparativas numericas entre FL, REF y el hibrido); la unica valoracion es cualitativa: se espera que el hibrido no supere la calidad de FL en generacion sin condicionamiento por referencias, ya que la mayor parte de sus pesos procede de FL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el repositorio completo ocupa 61,2 GB y contiene tres checkpoints (BF16, INT8 y W4A8), por lo que un unico fichero en BF16 se situa con toda probabilidad en decenas de GB; se trata de una estimacion derivada del tamano del repositorio, no de un dato publicado.
- GPU recomendadas: no disponibles. Por el perfil de un DiT de video de este tamano, el rango esperable son aceleradores profesionales tipo A100 o H100 con 80 GB, o configuraciones multi-GPU; la model card no confirma ninguna lista de GPU compatibles.
- Compatibilidad con GPU de consumo: no confirmada. Las variantes INT8 y W4A8 estan pensadas para reducir el coste de memoria, lo que hace plausible su ejecucion en tarjetas de consumo con 24 GB (RTX 4090 y similares), pero no hay validacion publicada en la informacion disponible.
- Opciones de despliegue: ComfyUI es el entorno de referencia indicado por el autor; los ficheros se colocan en `ComfyUI/models/diffusion_models/` y se cargan con el cargador habitual de MiniMax H3, sin nodos personalizados. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Calidad de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cobijada MiniMax-H3 Hybrid (este modelo) | no disponible | FL (primer/ultimo fotograma) + REF (imagen/video/audio) en un solo checkpoint | Base FL, con la via de referencias de REF en los bloques 25-49 | Apache 2.0 para el merge; pesos originales bajo licencia de MiniMax | HuggingFace, tres variantes de precision, 0 descargas |
| MiniMax H3 FL | no disponible | Solo primer/ultimo fotograma | La mas alta en generacion sin referencias, segun la propia model card | Licencia original de MiniMax | Checkpoint oficial |
| MiniMax H3 REF | no disponible | Referencias de imagen, video y audio | Inferior a FL, incluida la generacion sin referencias, segun la model card | Licencia original de MiniMax | Checkpoint oficial |
| Otras alternativas de generacion de video (Wan, HunyuanVideo y similares) | no disponible | no disponible | no disponible | no disponible | No se aporta informacion en la documentacion consultada |

## Limitaciones y advertencias

- No se ha realizado ningun entrenamiento, ajuste fino ni optimizacion con gradientes: es una seleccion de tensores y hereda tanto las virtudes como los defectos de los checkpoints de origen.
- El propio autor advierte de que el modelo no debe superar la calidad de FL en generacion sin condicionamiento por referencias, dado que comparte con FL la mayor parte de los pesos.
- La via de condicionamiento por referencias se ha trasladado seleccionando los `adaln_proj` de los bloques 25 a 49; no hay evaluacion publicada sobre la fidelidad real de esa via en el hibrido (consistencia de identidad, adherencia a la referencia, artefactos temporales).
- Ambas variantes de origen eran "uncensored", por lo que cabe esperar una menor resistencia a generar contenido sensible. No se detalla ningun sistema de filtrado o moderacion.
- Riesgo de alucinacion y de artefactos visuales o de desincronizacion audio-video: inherente a los modelos de difusion de video, aunque no se cuantifica en la informacion disponible.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento con prompts en castellano ni en otras lenguas distintas de las usadas en el entrenamiento original.
- Licencia: el merge, las conversiones y el repositorio son Apache 2.0, pero los pesos subyacentes de MiniMax H3 mantienen la licencia original de MiniMax. Es imprescindible revisar esos terminos antes de cualquier uso comercial, ya que Apache 2.0 no cubre el material de origen.
- Repositorio sin traccion: 0 descargas y 1 like en el momento de la consulta, con ultima actualizacion el mismo dia de su creacion, lo que implica ausencia de validacion por parte de terceros.
- Las cuantizaciones INT8 y W4A8 introducen perdida de precision respecto al BF16; no se publican mediciones de esa degradacion.
- Los ficheros deben cargarse con el cargador de MiniMax H3 en ComfyUI; no se documenta compatibilidad con otros runtimes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- Imagen de presentacion del modelo: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI/resolve/main/H3_Hybrid.png
- Perfil del autor: https://huggingface.co/Winnougan
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- MiniMax H3 (checkpoints oficiales FL y REF): no se ha encontrado el enlace en la busqueda web proporcionada
- Paper tecnico de MiniMax H3: no disponible en la informacion proporcionada
