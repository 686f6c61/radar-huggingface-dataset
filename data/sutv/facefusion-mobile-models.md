# sutv/facefusion-mobile-models

## Resumen

FaceFusion Mobile model sets es una coleccion de modelos convertidos para FaceFusion Mobile, un port para Android del pipeline por defecto de face-swap de FaceFusion que se ejecuta integramente en el telefono. No se trata de un modelo generativo unico, sino de un conjunto de redes especializadas (detector facial, landmarker 2D, reconocedor facial, swapper, enhancer, lip syncer, editor/animador facial y comprobador de contenido) empaquetadas en dos formatos de despliegue: binarios de contexto Hexagon para NPU de Qualcomm y modelos ncnn para GPU Vulkan con fallback a CPU.

El repositorio lo publica el usuario sutv en Hugging Face y esta pensado para el consumo directo de la aplicacion, que mide el chip al arrancar y descarga automaticamente el conjunto adecuado. La propuesta resuelve el problema de llevar un pipeline de face-swap de alta calidad a hardware movil heterogeneo, con cuantizacion W8A16 por canal para NPU y almacenamiento fp16 para ncnn, y con verificacion de integridad via SHA256 en `manifest.json`.

El interes actual reside en la ingenieria de despliegue: cuatro tiers de contexto Hexagon (v68, v73, v79, v81) que no son intercambiables, un conjunto ncnn universal de 604,1 MB y una serie de decisiones de cuantizacion documentadas con metricas de SNR y latencia por etapa. El tamano total del repositorio es de 5,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de redes CNN especializadas (YOLOFace, FAN 2D, ArcFace, HyperSwap, GPEN, Wav2Lip, LivePortrait, comprobador NSFW); no es un transformer unico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision/audio por frame, no LLM) |
| Tipos de cuantizacion | W8A16 por canal (QAIRT 2.49.0) para Hexagon; fp16 (ncnn); fp32 en `nsfw_v79.bin` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other / mixed-per-model, enlazada a la licencia de FaceFusion |
| Formato de pesos | binarios de contexto QAIRT (`.bin`) para Hexagon; pares `.param` + `.bin` para ncnn |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: convierte a formatos moviles los modelos por defecto del pipeline de face-swap de FaceFusion. Cada etapa es una red convolucional independiente con su propia resolucion de entrada: detector YOLOFace a 640x640, landmarker FAN 2D con corte de grafo en `heatmaps`, reconocedor ArcFace con embedding de 512 dimensiones, swapper HyperSwap a 256x256, enhancer GPEN a 256x256, lip syncer Wav2Lip a 96x96 y el conjunto LivePortrait para edicion y animacion facial. El comprobador de contenido se distribuye en tres variantes segun arquitectura y version de la app.

La conversion se hizo con QAIRT 2.49.0 aplicando cuantizacion W8A16 por canal, con el swapper degradado a fp32 antes de cuantizar. Para el conjunto ncnn se almacena en fp16. El enhancer incorpora una optimizacion destacable: colapsar 18 bloques de desenfoque en una convolucion agrupada, lo que redujo la latencia de 23,35 ms a 2,45 ms por cara en v79 sin perdida de precision. El Wav2Lip es el modelo que mejor cuantiza del repositorio, con un SNR de despliegue de 44,30 dB en el peor de seis casos reservados (frente a 47,61 dB del build en coma flotante), sobre un grafo de 143 nodos de convoluciones, ReLU y sumas. El swapper mide 30,87 dB y el enhancer 38,23 dB.

## Capacidades

- Deteccion facial sobre imagenes de 640x640 mediante YOLOFace.
- Extraccion de landmarks faciales 2D con FAN.
- Reconocimiento e identificacion facial mediante embeddings de 512 dimensiones (ArcFace).
- Face swap a 256x256 con HyperSwap.
- Restauracion de detalle del rostro intercambiado con GPEN (opcional, 8,57 GMAC por cara frente a 31,93 del swapper).
- Sincronizacion labial con Wav2Lip a partir de una ventana de 200 ms de audio del propio clip en forma de espectrograma mel 80x16 (opcional, requiere audio).
- Edicion y animacion facial con LivePortrait (cuatro grafos que deben usarse juntos).
- Comprobacion de contenido NSFW obligatoria; la app trata la ausencia del gate como fallo de inicializacion.
- Ejecucion on-device en NPU Hexagon (Qualcomm) o en GPU Vulkan con fallback a CPU via ncnn.

## Casos de uso

- Face-swap en tiempo real en Android: la app selecciona el tier Hexagon adecuado al chip y ejecuta el pipeline completo en el dispositivo, con 75 ms por frame a 720p en Snapdragon 8 Elite usando NPU.
- Procesado por lotes de video en telefono: el conjunto ncnn permite ejecutar el mismo swap en dispositivos sin NPU Qualcomm, con unos 325 ms por frame a 720p en el mismo SoC con la NPU desactivada.
- Doblaje y sincronizacion labial de clips: Wav2Lip redibuja la boca a partir del audio del propio clip, con un coste de aproximadamente 1 ms por frame y unos 28 ms por segundo de audio en la preparacion del mel.
- Restauracion de detalle en retratos tras el intercambio: GPEN recupera textura en la cara generada a 2,45 ms por cara en v79, y puede descargarse por separado desde ajustes en instalaciones antiguas.
- Animacion de retratos: el conjunto LivePortrait (cuatro grafos obligatoriamente juntos) habilita edicion y animacion facial sobre la imagen procesada.
- Moderacion de contenido en pipelines de edicion de imagen: el comprobador NSFW cuantizado se ejecuta como gate obligatorio antes de entregar el resultado, con un desplazamiento de aproximadamente +0,087 en el estadistico de decision hacia el marcado en los tiers bajos.
- Integracion en apps de terceros sobre Android: los pares `.param`/`.bin` de ncnn y los binarios QAIRT permiten embeber el pipeline en aplicaciones propias, verificando integridad con los SHA256 de `manifest.json`.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| SNR de despliegue Wav2Lip | 44,30 dB (peor de 6 reservados) | Build float: 47,61 dB |
| SNR de despliegue swapper | 30,87 dB | no disponible mas detalle |
| SNR de despliegue enhancer | 38,23 dB | no disponible mas detalle |
| Latencia Wav2Lip | 1,03 ms por frame en v79 | Primera carga: 13 ms |
| Latencia enhancer | 2,45 ms por cara en v79 | Build anterior: 23,35 ms |
| Coste de preparacion de audio | ~28 ms por segundo de audio | Una vez por clip |
| Latencia ncnn a 720p | ~325 ms por frame | Snapdragon 8 Elite con NPU desactivada |
| Latencia NPU a 720p | ~75 ms por frame | Snapdragon 8 Elite |
| Acuerdo ncnn vs NPU | 42,7 dB | Mismo swap, no aproximacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- NPU Qualcomm Hexagon segun tier: v68 para Snapdragon 888 y anteriores, 8 Gen 1 o cualquier chip con menos de 8 MB de VTCM; v73 para 8 Gen 2, 8 Gen 3 y partes v79 distintas del SM8750; v79 para Snapdragon 8 Elite (SM8750); v81 para Snapdragon 8 Elite Gen 5.
- Descarga por tier: 355,4 a 361,1 MB segun el conjunto Hexagon; 604,1 MB para el conjunto ncnn universal.
- El tier de contexto no equivale a la arquitectura de runtime: un 8 Gen 3 es silicio v73 que usa el tier de contexto v68 pero necesita el runtime V73 incluido en el APK.
- Los binarios Hexagon estan fijados a una arquitectura concreta y no cargan en otra.
- El conjunto ncnn funciona en cualquier telefono compatible con Vulkan, con fallback a CPU; dos etapas quedan fijadas a CPU independientemente del dispositivo (la model card se corta en ese punto).
- Despliegue mediante la app FaceFusion Mobile, que mide el chip al arrancar, descarga el conjunto adecuado y verifica cada SHA256 antes de usar los ficheros.
- No se proporcionan datos de VRAM ni de GPU de escritorio; el objetivo es hardware movil.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| FaceFusion Mobile model sets (este) | Pipeline face-swap movil | QAIRT Hexagon + ncnn | 355-604 MB por conjunto | other / mixed-per-model | Cuatro tiers NPU y conjunto universal ncnn |
| FaceFusion (upstream) | Pipeline face-swap de escritorio | ONNX y otros | no disponible | ver licencia de FaceFusion | Referencia funcional; incluye extractor de voz de 66,8 MB no convertido aqui |
| Modelos face-swap genericos en Hugging Face | Swapper aislado | safetensors/ONNX | variable | variable | No cubren el pipeline completo ni el despliegue movil |

No se dispone de datos de rendimiento comparables con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto Hexagon esta fijado a una arquitectura: un binario no carga en otro chip, y mezclar tiers no esta permitido.
- El Wav2Lip se ejecuta sobre el audio tal como se grabo; el upstream usa el mel de la voz aislada tras un extractor de 66,8 MB que no se ha convertido, por lo que clips con musica de fondo reciben una entrada distinta a la prevista.
- El comprobador NSFW es obligatorio; la app trata su ausencia como fallo de inicializacion. La variante cuantizada desplaza el estadistico de decision unos +0,087 hacia el marcado, de modo que los tiers bajos rechazan con mas facilidad que v79.
- `nsfwq_<tier>.bin` esta obsoleto y calibrado con un rango de entrada incorrecto; solo se mantiene para instalaciones de la app 0.2.1.
- El lip syncer no esta disponible para fotos ni clips sin audio, al no haber senal de condicionamiento.
- El enhancer es opcional y el pipeline omite su etapa si falta el binario.
- Los cuatro grafos de LivePortrait deben usarse juntos.
- La licencia es mixta por modelo y remite a la licencia de FaceFusion; es responsabilidad del integrador revisar las condiciones de uso comercial de cada componente.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica, al no ser un modelo de lenguaje.
- La model card se interrumpe en la seccion del conjunto ncnn, por lo que pueden faltar advertencias adicionales sobre etapas fijadas a CPU.

## Enlaces

- Hugging Face: https://huggingface.co/sutv/facefusion-mobile-models
- FaceFusion Mobile (repositorio Android): https://github.com/AbrahamPaulJ/facefusion-mobile
- FaceFusion (upstream): https://github.com/facefusion/facefusion
- Licencia de FaceFusion: https://github.com/facefusion/facefusion/blob/master/LICENSE.md
