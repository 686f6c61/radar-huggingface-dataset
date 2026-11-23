# textnology-inc-aisle/coreml-vision

## Resumen

`textnology-inc-aisle/coreml-vision` no es un modelo entrenado desde cero, sino un repositorio de conversiones a Core ML de dos modelos de visión ya existentes: OWLv2 (variante `google/owlv2-base-patch16-ensemble`) y CLIP ViT-B/32 (`openai/clip-vit-base-patch32`). El autor, `textnology-inc-aisle`, publica los artefactos empaquetados en formato `.mlpackage` listos para su ejecución en el ecosistema Apple (iOS 18 o superior), lo que permite desplegar detección de objetos zero-shot y embeddings imagen-texto en dispositivos Apple sin depender de un servidor.

El interés practico del repositorio reside en el trabajo de conversion y optimizacion, no en una mejora de capacidades respecto a los modelos originales. En OWLv2 se elimina el codificador de texto y se incrustan como constantes los embeddings de las consultas textuales, se elimina la cabeza de objectness y se incorpora la decodificacion de cajas y la normalizacion de entrada dentro del grafo. En CLIP se exporta unicamente el codificador de imagen, con salida de 512 dimensiones normalizada L2, y se ofrecen variantes FP16 y W8A16 INT8.

El repositorio ocupa 0.6 GB e incluye cuatro artefactos: dos variantes de OWLv2 (entrada 960x960 y 768x768, FP16) y dos de CLIP ViT-B/32 (224x224, FP16 e INT8). La licencia es dual: Apache-2.0 para los ficheros derivados de OWLv2 y MIT para los derivados de CLIP, con atribucion completa en el fichero `NOTICE`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OWLv2 (ViT con encoder de texto para deteccion zero-shot) y CLIP ViT-B/32 (encoder de imagen ViT); conversiones a Core ML ML Program |
| Parametros totales | no disponible (el repositorio no publica el recuento; depende del modelo upstream) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; OWLv2 acepta consultas de texto fijas incrustadas como constantes) |
| Tipos de cuantizacion | FP16 (OWLv2 y CLIP) y W8A16 INT8 con `per_block=32` (solo CLIP, pesos LayerNorm en FP16) |
| Idiomas soportados | no disponible; el modelo upstream CLIP esta entrenado y evaluado solo en ingles, y las consultas de OWLv2 estan fijadas en el momento de la conversion |
| Licencia | Apache-2.0 (ficheros OWLv2) y MIT (ficheros CLIP); licencia agregada `apache-2.0-and-mit` |
| Formato de pesos | Core ML `.mlpackage` (comprimido en `.zip`) |

## Arquitectura y entrenamiento

Los modelos subyacentes son dos arquitecturas transformer de vision bien conocidas. OWLv2 es un detector zero-shot que combina un backbone ViT con un encoder de texto y aprende a alinear regiones de imagen con consultas textuales; en esta conversion se ha eliminado el encoder de texto y se han incrustado los embeddings de las consultas como constantes, de modo que el grafo resultante solo ejecuta la parte visual y devuelve cajas, puntuaciones y clases. Se han fijado dos tamanos de entrada (960x960 y 768x768, este ultimo con interpolacion de los embeddings posicionales), se ha eliminado la cabeza de objectness y se ha integrado la decodificacion de cajas y la normalizacion de entrada dentro del grafo. CLIP ViT-B/32 es un modelo contrastivo imagen-texto; la conversion exporta solo el encoder de imagen, con salida L2-normalizada de 512 dimensiones, normalizacion de entrada en el grafo y cuantizacion opcional W8A16 por bloques de 32.

No se aportan datos de entrenamiento propios: el repositorio no reentrena ni ajusta los modelos, solo los convierte. Cualquier detalle sobre corpus, numero de tokens, RLHF o evaluacion debe consultarse en las model cards upstream de OWLv2 y CLIP. La innovacion tecnica aqui es de despliegue: empaquetado Core ML con `computeUnits` recomendados (`.cpuAndGPU` para OWLv2, `.all` para CLIP), precisiones seleccionables y metadatos legibles por maquina en `manifest.json` con hashes SHA-256 por artefacto.

## Capacidades

- Deteccion de objetos zero-shot con OWLv2: localiza instancias de las clases fijadas en la conversion mediante cajas, puntuaciones y etiquetas de clase.
- Deteccion con dos tamanos de entrada: 960x960 (hasta 3600 detecciones candidatas) y 768x768 (hasta 2304), con precision FP16.
- Embeddings de imagen con CLIP ViT-B/32: vector de 512 dimensiones L2-normalizado, en FP16 o INT8, para busqueda y comparacion semantica.
- Ejecucion en dispositivo Apple mediante Core ML (iOS 18 o superior), sin necesidad de servidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: son modelos puramente visuales.
- No hay capacidades multilingues: las consultas de OWLv2 estan fijadas y CLIP esta evaluado solo en ingles.
- No incluye modo thinking, audio ni video.

## Casos de uso

- Deteccion de objetos en apps iOS: integrar el `.mlpackage` de OWLv2 en una app para localizar categorias predefinidas en fotos del usuario sin enviar imagenes a un servidor, aprovechando `computeUnits: .cpuAndGPU`.
- Busqueda visual en galerias locales: usar los embeddings CLIP de 512 dimensiones para indexar fotos en el dispositivo y recuperar imagenes por similitud semantica, con la variante INT8 para reducir huella de memoria.
- Moderacion de contenido en el borde: clasificar o localizar elementos en imagenes capturadas por la camara antes de subirlas, manteniendo los datos en el dispositivo.
- Etiquetado asistido de imagenes: OWLv2 puede proponer cajas y clases sobre un conjunto fijo de categorias para acelerar el etiquetado manual en herramientas internas.
- Prototipado rapido en macOS/iOS: validar pipelines de vision (deteccion + embedding) en un Mac antes de mover la logica a produccion, gracias a la compatibilidad de Core ML con el entorno Apple.
- Accesibilidad: describir o resaltar objetos de interes en la escena para aplicaciones de asistencia visual, con inferencia local y baja dependencia de red.
- Filtrado previo en pipelines de captura: descartar imagenes sin objetos relevantes usando las puntuaciones de OWLv2 antes de procesarlas en un backend mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision, latencia ni throughput; solo tamanos de artefacto y hashes SHA-256. Cualquier cifra de evaluacion debe tomarse de las model cards upstream de OWLv2 y CLIP, no de esta conversion.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en el hardware unificado de dispositivos Apple. Los tamanos de artefacto son: OWLv2 960 FP16 166,795,390 bytes; OWLv2 768 FP16 164,924,490 bytes; CLIP INT8 90,817,268 bytes; CLIP FP16 162,595,740 bytes.
- GPU recomendadas: no disponible; el autor recomienda `computeUnits: .cpuAndGPU` para OWLv2 y `.all` para CLIP, sin especificar dispositivos.
- Cabe en hardware consumer Apple: si, al estar disenado para Core ML en iOS 18+ y macOS; no se detalla que iPhone, iPad o Mac concretos.
- Opciones de despliegue: Core ML (`.mlpackage`), con `manifest.json` para automatizacion. No se ofrecen pesos GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `textnology-inc-aisle/coreml-vision` (OWLv2 + CLIP) | Deteccion zero-shot + embeddings, Core ML | no disponible | no aplica | Apache-2.0 + MIT | Hugging Face, `.mlpackage` |
| `google/owlv2-base-patch16-ensemble` | Deteccion zero-shot, PyTorch | no disponible | no aplica | Apache-2.0 | Hugging Face |
| `openai/clip-vit-base-patch32` | Embeddings imagen-texto, PyTorch | no disponible | no aplica | MIT | Hugging Face |
| Alternativas Core ML de vision | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra los modelos upstream: este repositorio no mejora la precision, solo cambia el formato y el entorno de ejecucion (Core ML frente a PyTorch), con las limitaciones que ello implica (consultas de texto fijas en OWLv2, solo encoder de imagen en CLIP).

## Limitaciones y advertencias

- Las consultas de texto de OWLv2 estan incrustadas como constantes: no se pueden cambiar sin reconvertir el modelo. La deteccion queda restringida a las clases fijadas en la conversion.
- CLIP ViT-B/32 incluye solo el encoder de imagen; no hay encoder de texto, por lo que no se puede calcular similitud imagen-texto directamente con este artefacto.
- La model card upstream de CLIP declara fuera de alcance cualquier caso de uso desplegado, comercial o no, sin pruebas exhaustivas en el dominio y con una taxonomia fija de clases; tambien excluye explicitamente vigilancia y reconocimiento facial y limita el uso a ingles.
- Riesgo de alucinacion y falsos positivos inherente a la deteccion zero-shot: las puntuaciones de OWLv2 no deben tratarse como probabilidades calibradas sin validacion en el dominio.
- Sesgos heredados de los datos de entrenamiento upstream, no evaluados en esta conversion.
- Limitaciones de idioma: CLIP no fue entrenado ni evaluado en idiomas distintos del ingles; las etiquetas de OWLv2 dependen de las consultas incrustadas.
- Restricciones de licencia: Apache-2.0 para OWLv2 y MIT para CLIP, con obligacion de conservar atribucion y avisos del fichero `NOTICE`; el autor declara no estar afiliado a Google ni a OpenAI.
- Dependencia de plataforma: requiere Core ML e iOS 18 o superior; no es portable a entornos no Apple sin reconversion.
- Sin benchmarks publicados: no hay evidencia en el repositorio sobre la perdida de precision introducida por FP16 o INT8.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/textnology-inc-aisle/coreml-vision
- Fichero NOTICE: https://huggingface.co/textnology-inc-aisle/coreml-vision/blob/main/NOTICE
- Modelo upstream OWLv2: https://huggingface.co/google/owlv2-base-patch16-ensemble
- Paper OWLv2: https://arxiv.org/abs/2306.09683
- Repositorio Scenic (Google Research): https://github.com/google-research/scenic
- Modelo upstream CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Paper CLIP: https://arxiv.org/abs/2103.00020
- Repositorio OpenAI CLIP: https://github.com/openai/CLIP
- Model card de CLIP (referencia): https://github.com/openai/CLIP/blob/main/model-card.md
