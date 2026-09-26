# ZACK777/hi-mapper

## Resumen

HI-Mapper es un módulo de mapeo jerárquico en espacio hiperbólico (modelo de Lorentz) diseñado como rama auxiliar de PromptPAR, un framework de prompt learning para reconocimiento de atributos de peatones. Lo publica el usuario ZACK777 en Hugging Face bajo licencia Apache-2.0 y con licencia Apache-2.0 para el código, e incluye tanto el código fuente (`lorentz.py`, `tree.py`, `hi_mapper.py`, `hyp_diffusion.py`) como los dos checkpoints de visión que PromptPAR necesita para ejecutarse: CLIP ViT-L/14 de OpenAI (~890 MB) e ImageNet ViT-B/16 de Google/timm (~331 MB). El repositorio ocupa 1,3 GB y su `pipeline_tag` es `feature-extraction`.

El problema que aborda es la organización de atributos de peatones (género, ropa, accesorios, edad aparente) en una taxonomía con relaciones de jerarquía y entrañamiento (entailment), algo que un espacio euclídeo plano modela mal. HI-Mapper aplica un lift fijo de Euclídeo a Lorentz con escalador de norma en ejecución, distancia estable y conos de entrañamiento, e incorpora el agrupamiento de atributos PETA en `DivHiMapper`. Es relevante ahora porque repara un lift anterior que estaba roto (mA ~0,615, por debajo de la línea base histórica) y demuestra que el loss jerárquico deja de quedarse plano en ~0,20 desde la primera época.

El modelo tiene descargas y likes nulos, y las ejecuciones completas de 15 y 100 épocas quedaron interrumpidas, por lo que los resultados publicados son parciales (épocas 1 a 3). La fecha indicada de creación en el repositorio es el 26 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapper jerárquico hiperbólico sobre espacio de Lorentz, con lift Euclídeo→Lorentz (escalador de norma en ejecución, distancia estable, conos de entrañamiento); clase `DivHiMapper` con agrupamiento de atributos PETA; backbones ViT-L/14 (CLIP) y ViT-B/16 (ImageNet) |
| Parametros totales | no disponible para el módulo HI-Mapper; los checkpoints incluidos corresponden a CLIP ViT-L/14 (~890 MB) y ViT-B/16 (~331 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo de texto; opera sobre features de 768 dimensiones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en formato PyTorch sin versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; no se declara soporte idiomático) |
| Licencia | Apache-2.0 para el código de HI-Mapper; los checkpoints CLIP y ViT conservan sus licencias originales |
| Formato de pesos | PyTorch: `.pt` (ViT-L-14.pt) y `.pth` (jx_vit_base_p16_224-80ecf9dd.pth); código Python en `hi_mapper/` |

## Arquitectura y entrenamiento

El núcleo es un mapeo fijo desde representaciones euclídeas hacia el modelo hiperbólico de Lorentz. El módulo `lorentz.py` implementa la variedad de Lorentz y la operación `EuclideanToLorentz`; `tree.py` define las pérdidas de entrañamiento, hermanos (sibling) y radio; `hi_mapper.py` contiene `DivHiMapper` junto con el agrupamiento de atributos PETA; y `hyp_diffusion.py` completa la rama hiperbólica. La invocación devuelve seis salidas: `root`, `mid`, `leaves`, `hier_loss`, `prompt_loss` y `attr_loss`, lo que indica que la jerarquía se organiza en tres niveles (raíz, intermedio, hojas) con supervisión específica por nivel. La firma de ejemplo usa `feat_dim=768`, `curvature=0.2` y `target_radius=1.0`.

El entrenamiento se evalúa sobre el dataset PETA con los flags de PromptPAR `--use_textprompt --use_div --use_vismask --use_GL --use_mm_former`, más `--use_attr_hierarchy`. Los hiperparámetros por defecto de HI-Mapper son `c=0,2`, `hi_mapper_w=0,1`, calentamiento de 3 épocas y radio objetivo configurable (`hyp_target_radius`, probado en 1,5). La innovación destacable es el lift estable: frente al lift roto anterior (que arrancaba en ~0,615 y quedaba por debajo de la línea base), la pérdida jerárquica cae de 1,720 en la época 1 a 0,187 en la época 3, en lugar de quedarse estancada en ~0,20 desde el principio. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extracción de features y mapeo jerárquico de atributos de peatones: produce representaciones en tres niveles (raíz, intermedios, hojas) sobre un espacio de Lorentz.
- Modelado de relaciones de entrañamiento y jerarquía: conos de entrañamiento, pérdidas de hermanos y pérdida de radio para estructurar la taxonomía de atributos.
- Agrupamiento de atributos PETA mediante `DivHiMapper`, con soporte del flag `--use_attr_hierarchy`.
- Integración con prompt learning: funciona como rama adicional de PromptPAR y consume sus features (textprompt, vision mask, GL, MM-former).
- Backbone de visión CLIP ViT-L/14 incluido, lo que permite extracción de features de imagen compatibles con el espacio CLIP.
- Inicialización de bloques MM-former mediante pesos ImageNet ViT-B/16 incluidos en el repositorio.
- Difusión en espacio hiperbólico a través de `hyp_diffusion.py` (componente incluido en el código; sin resultados publicados en la información disponible).
- No se declara soporte de tool calling, function calling, agentes, capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Reconocimiento de atributos de peatones en videovigilancia: el modelo se acopla a PromptPAR para etiquetar atributos (ropa, accesorios, género aparente) sobre el dataset PETA, aprovechando la jerarquía para que un error en un nivel superior no desestructure las etiquetas hijas.
- Organización de taxonomías de atributos: las pérdidas de entrañamiento permiten construir y mantener relaciones padre-hijo entre atributos, útil cuando el catálogo de etiquetas crece y se reorganiza.
- Anotación automática de datasets: al ser un extractor de features con cabezas jerárquicas, puede preetiquetar grandes volúmenes de imágenes de peatones y reservar la revisión humana para los casos de baja confianza.
- Recuperación de imágenes por atributos: las representaciones en el espacio de Lorentz permiten consultas del tipo "peatón con mochila y gorra" navegando la jerarquía en lugar de comparar etiquetas planas.
- Analítica urbana y seguridad vial: conteo y caracterización de viandantes por tramos horarios para estudios de movilidad, usando la rama hiperbólica como capa de estructuración sobre el backbone CLIP.
- Investigación en representaciones hiperbólicas: el repositorio sirve como banco de pruebas reproducible para comparar lifts Euclídeo→Lorentz (el README documenta explícitamente el fallo del lift anterior y su corrección).
- Analítica de retail o señalización: caracterización de atributos de personas en imágenes de cámara fija para estudios de afluencia, siempre que se cumplan los requisitos legales de tratamiento de imagen.

## Benchmarks y rendimiento

Dataset PETA. Flags de PromptPAR: `--use_textprompt --use_div --use_vismask --use_GL --use_mm_former`. HI-Mapper por defecto: `c=0,2`, `hi_mapper_w=0,1`, calentamiento de 3 épocas, `--use_attr_hierarchy`.

Etapa A, puerta de "no hacer daño" a 1 época:

| Config | mA época 1 | Acc | F1 | Notas |
|---|---|---|---|---|
| A_control (sin HI-Mapper) | 0,6102 | 0,4972 | 0,6412 | línea base |
| A_default (HI-Mapper) | 0,6375 | 0,5059 | 0,6492 | +2,7 puntos frente al control |
| A_attr | 0,6375 | 0,5059 | 0,6492 | idéntico a default (attr activado) |
| A_r15 (`hyp_target_radius=1.5`) | 0,6406 | 0,4981 | 0,6407 | mejor resultado en época 1 |
| A_prompt | 0,6345 | 0,5050 | 0,6483 | |
| A_w030 (`hi_mapper_w=0.3`) | 0,6286 | 0,4894 | 0,6339 | |

Etapa B, 15 épocas comprimidas (parcial, épocas 1 a 3 antes de la interrupción):

| Época | mA control | mA HI-Mapper | Acc HI-Mapper | F1 HI-Mapper | `hi_mapper_loss` (media de época) |
|---|---|---|---|---|---|
| 1 | 0,6102 | 0,6175 | 0,5139 | 0,6578 | 1,720 |
| 2 | 0,6337 | 0,6720 | 0,5288 | 0,6677 | 1,029 |
| 3 | 0,6943 | 0,6997 | 0,5634 | 0,6957 | 0,187 |

Referencia publicada de PromptPAR en PETA (TCSVT 2024): mA 88,76 / Acc 82,84 / F1 89,18, con schedule coseno completo de 100 épocas. Las ejecuciones completas de 15 y 100 épocas quedaron interrumpidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los pesos incluidos suman ~1,22 GB en disco (CLIP ViT-L/14 ~890 MB + ViT-B/16 ~331 MB); en fp16 la inferencia de ViT-L/14 suele requerir del orden de 2 a 4 GB de VRAM, pero es una estimación, no un dato del repositorio.
- GPU recomendadas: no disponible. El repositorio no especifica hardware; por tamaño de backbone, una GPU consumer con 6-8 GB de VRAM debería poder alojar los dos checkpoints en fp16, aunque no está verificado por el autor.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; el tamaño de los pesos sugiere que sí en tarjetas con al menos 8 GB, sin garantía.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia. El uso previsto es PyTorch directo mediante `hf download` y copia de los checkpoints a `.cache/clip/ViT-L-14.pt` y al directorio de trabajo para `jx_vit_base_p16_224-80ecf9dd.pth`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | PETA (mA) | Licencia |
|---|---|---|---|---|---|
| HI-Mapper + PromptPAR (este repositorio) | Mapper jerárquico hiperbólico sobre backbone ViT-L/14 | no disponible para el módulo | Features de 768 dimensiones, imágenes 224 px | 0,6375 (época 1), 0,6997 (época 3, ejecución parcial) | Apache-2.0 (código); pesos CLIP/ViT con licencias originales |
| PromptPAR publicado (TCSVT 2024) | Prompt learning con máscara de visión | no disponible | Imágenes de peatones | 88,76 (schedule completo de 100 épocas) | no disponible |
| CLIP ViT-L/14 (OpenAI) | Contraste imagen-texto, zero-shot | ~427 M (estimación externa, no confirmada en la ficha) | Imagen 224 px, texto hasta 77 tokens | no evaluado en PETA en esta información | Licencia OpenAI CLIP, distinta de Apache-2.0 |
| ImageNet ViT-B/16 (Google / timm) | Clasificación de imagen, transformer de visión | no disponible | Imagen 224 px | no evaluado en PETA | Licencia original de Google / timm |

## Limitaciones y advertencias

- Resultados parciales: las etapas B (15 épocas) y final (100 épocas) se interrumpieron; los números publicados cubren solo las épocas 1 a 3 y no son comparables directamente con las cifras de referencia de PromptPAR.
- Escalas de métrica no homogéneas: los resultados propios (mA ~0,61-0,70) y la referencia publicada (mA 88,76) parecen usar escalas distintas (fracción frente a porcentaje); conviene verificarlo antes de cualquier comparación.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación comunitaria ni resultados reproducidos por terceros.
- Fecha de creación anómala en Hugging Face (26 de septiembre de 2026), lo que dificulta situar la versión del artefacto.
- Licencia mixta: el código de HI-Mapper es Apache-2.0, pero los checkpoints de CLIP y de ViT-B/16 conservan sus licencias originales; el uso comercial debe revisar ambas por separado.
- Especialización estrecha: está entrenado y evaluado sobre PETA para atributos de peatones; no se declara transferencia a otros dominios.
- Sin cuantizaciones publicadas ni soporte documentado en runtimes de inferencia habituales (vLLM, llama.cpp, TGI, Ollama).
- Riesgo de sesgo: los atributos de peatones (género aparente, complexión, vestimenta) son sensibles; no se documenta ninguna evaluación de equidad ni mitigación de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la asignación de atributos, sin métricas de calibración publicadas.
- No se documentan idiomas soportados, ni comportamiento multilingüe, ni límites de contexto (el concepto no aplica a un extractor de features).
- Requisitos de hardware no especificados por el autor: cualquier plan de despliegue exige una medición propia de VRAM y latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZACK777/hi-mapper
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a sitios de contenido para adultos ajenos por completo al objeto de la ficha, por lo que se descartan.
- No se dispone de enlaces a paper, blog, repositorio de código independiente ni demo más allá de la propia página del modelo en Hugging Face.
