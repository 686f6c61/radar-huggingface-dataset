# WAS/was-node-suite-weights

## Resumen

WAS Node Suite weights es un repositorio de pesos alojado en Hugging Face por el autor WAS (WASasquatch), creador del conjunto de nodos personalizados WAS Node Suite para ComfyUI. No se trata de un modelo entrenado por el autor, sino de una coleccion centralizada de checkpoints de terceros que los nodos de la suite necesitan para funcionar: denoising, mejora de escenas con poca luz, reconstruccion HDR, eliminacion de fondo, flujo optico y modelos de difusion para generacion y edicion de video e imagen. El objetivo declarado es evitar que un nodo deje de funcionar cuando una copia alojada por un tercero se mueve o se elimina.

El repositorio agrupa familias muy distintas: desde pequenos modelos de restauracion (SCUNet, NAFNet, HVI-CIDNet, Retinexformer, DarkIR, HDRCNN, BiRefNet, BEN2, FlowSeek) hasta pesos cuantizados de modelos generativos de gran tamano como Kandinsky 6 (video con audio y superresolucion de video), BluePixel-Turbo 4K (edicion de imagen) y Gemma 4 12B instruct con sus torres de vision y audio. Algunos archivos son copias byte a byte de los originales, otros se han convertido a safetensors y los pesos bajo `models/` son conversiones y cuantizaciones propias para ComfyUI.

La relevancia del repositorio es practica: actua como espejo de dependencias para un ecosistema de nodos de ComfyUI orientado a postprocesado y restauracion de imagen y video. El tamano total del repositorio es de 246,7 GB y cada archivo conserva la licencia de su obra de origen, con restricciones notables: el VAE de audio de Kandinsky 6 y los transformers de BluePixel son solo para uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio heterogeneo: CNN de restauracion, transformers de difusion, VLM con torres de vision y audio) |
| Parametros totales | No disponible (depende del archivo; el mayor referenciado es Gemma 4 12B instruct) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 ConvRot, W6A8, W4A8, bf16 (en `models/`); fp32/fp16 en los checkpoints de restauracion |
| Idiomas soportados | No disponible |
| Licencia | Por archivo (`license: other`, `license_name: per-file`); mayoritariamente MIT, Apache-2.0, BSD-3-Clause; Kandinsky 6 audio VAE y BluePixel solo uso no comercial |
| Formato de pesos | safetensors, .pth, .pt |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: agrega pesos de trabajos upstream y, en la carpeta `models/`, publica conversiones y cuantizaciones para que ComfyUI pueda cargarlos de forma nativa. Los modelos de restauracion y vision por computador son en su mayoria redes convolucionales o hibridas especializadas: SCUNet y NAFNet para denoising, HVI-CIDNet, Retinexformer y DarkIR para mejora en condiciones de poca luz, HDRCNN para reconstruccion de alto rango dinamico, BiRefNet y BEN2 para segmentacion y eliminacion de fondo, y FlowSeek para flujo optico (que incorpora los pesos de Depth Anything V2 Small para leer profundidad).

Las familias generativas bajo `models/` son transformers de difusion convertidos a formatos cuantizados propios de ComfyUI: Kandinsky 6 (video con sonido, con transformers int8 ConvRot y W6A8, text encoders y VAE de audio; y superresolucion de video con int8 ConvRot, W6A8 y W4A8, K-VAE y upscalers latentes x2 y x4), BluePixel-Turbo 4K (edicion de imagen en bf16, int8 ConvRot, W6A8 y W4A8, con autoencoder DC-AE) y Gemma 4 12B instruct en int8 ConvRot con torres de vision y audio. No se dispone de informacion sobre volumen de tokens, composicion de datasets ni procesos de RLHF/DPO para ninguno de ellos en la informacion proporcionada.

## Capacidades

- Denoising de imagen en color real con SCUNet y NAFNet (dos anchos: width32 y width64).
- Mejora de imagenes con poca luz mediante HVI-CIDNet (cuatro variantes: generalizacion, SICE, Sony total dark y FiveK), Retinexformer (ocho variantes: NTIRE, LOL v1, LOL v2 real y sintetica, FiveK, SID, SMID, SDSD indoor y outdoor) y DarkIR.
- Reconstruccion HDR con HDRCNN.
- Eliminacion de fondo y segmentacion con BiRefNet (diez variantes: General, General-HR, General-dynamic, General-reso_512, DIS, DIS-TR_TEs, COD, HRSOD, Matting-HR, Portrait) y BEN2 base.
- Estimacion de flujo optico con FlowSeek (checkpoints `t_ct` y `t_tskh`), con lectura de profundidad mediante Depth Anything V2 Small.
- Generacion de video con audio mediante Kandinsky 6 y superresolucion de video x2 y x4.
- Edicion de imagen 4K con BluePixel-Turbo.
- Razonamiento multimodal texto, vision y audio con Gemma 4 12B instruct.
- Integracion nativa con ComfyUI: carga de difusion, cargadores especificos de Kandinsky 6 y BluePixel, y carga de modelos de lenguaje.
- Descarga automatica de dependencias con `features.network: true` en `config.yaml`.

## Casos de uso

- Restauracion de fotografia antigua o degradada: combinar SCUNet o NAFNet para eliminar ruido con HDRCNN para recuperar rango dinamico en un flujo de ComfyUI, sin salir del grafo de nodos.
- Mejora de video de vigilancia o grabaciones nocturnas: aplicar Retinexformer (variantes SID o SMID) o HVI-CIDNet sobre fotogramas extraidos, y estabilizar el resultado con el flujo optico de FlowSeek para interpolacion o compensacion de movimiento.
- Postproduccion de video generativo: usar Kandinsky 6 para generar video con pista de audio y su superresolucion x2/x4 para escalar el resultado a resolucion de entrega.
- Edicion de imagen a 4K en produccion grafica: BluePixel-Turbo permite retoques e instrucciones sobre imagen en alta resolucion con un autoencoder DC-AE, adecuado para pipelines de estudio con GPU de gama alta.
- Automatizacion de recortes de producto o retrato: BiRefNet Portrait o Matting-HR para matting fino, o BEN2 base para segmentacion general, integrados en un nodo de eliminacion de fondo por lotes.
- Asistencia multimodal en el propio grafo: Gemma 4 12B con torres de vision y audio permite describir imagenes, transcribir audio o generar instrucciones que alimenten otros nodos del flujo.
- Reproducibilidad de entornos ComfyUI: fijar este repositorio como fuente unica de pesos evita roturas cuando los repos upstream cambian o desaparecen, algo critico en despliegues de produccion y en CI de flujos de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del archivo cargado. Los modelos de restauracion (SCUNet, NAFNet, Retinexformer, BiRefNet) son ligeros y caben en GPU de consumo; los pesos de Kandinsky 6, BluePixel-Turbo 4K y Gemma 4 12B requieren GPU de gama alta o profesional.
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada; por el tamano de los modelos generativos y las cuantizaciones int8/W6A8/W4A8, se orientan a A100, H100 o RTX 4090 en adelante.
- Cabe en GPU de consumo: si para los modelos de restauracion y segmentacion; no confirmado para las familias generativas de mayor tamano.
- Opciones de despliegue: ComfyUI (entorno nativo de la suite), con carga mediante Load Diffusion Model, los nodos de Kandinsky 6, BluePixel Model Loader, BluePixel VAE Loader y Language Model Loader. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 246,7 GB; la descarga automatica solo trae los archivos fuera de `models/` que cada nodo necesite.

## Comparativa con modelos similares

| Aspecto | WAS Node Suite weights | Repos individuales upstream (p. ej. ZhengPeng7/BiRefNet, cszn/SCUNet) | Repos de conversion ComfyUI de un solo modelo |
|---|---|---|---|
| Proposito | Espejo agregado de dependencias para nodos | Publicacion original de un modelo | Conversion y cuantizacion de un modelo concreto |
| Cobertura | Multiples familias (restauracion, segmentacion, flujo optico, difusion, VLM) | Una sola familia | Un solo modelo |
| Licencia | Por archivo, con restricciones no comerciales parciales | La de cada proyecto | Variable |
| Formato | safetensors, .pth, .pt; int8 ConvRot, W6A8, W4A8, bf16 | Principalmente .pth y safetensors sin cuantizar | safetensors cuantizados |
| Tamano | 246,7 GB en total | Variable por modelo | Variable por modelo |
| Disponibilidad | Hugging Face, 1733 descargas, 3 likes | Hugging Face y GitHub | Hugging Face |

## Limitaciones y advertencias

- No es un modelo unico: no debe evaluarse como tal ni citarse con parametros o contexto unicos; cada archivo tiene su propia naturaleza y licencia.
- Licencias heterogeneas: aunque la mayoria son MIT, Apache-2.0 o BSD-3-Clause, el VAE de audio de Kandinsky 6 y los transformers de BluePixel son exclusivamente para uso no comercial; verificar archivo por archivo antes de un despliegue comercial.
- Riesgo de desactualizacion: al ser un espejo, puede quedar por detras de las versiones upstream; conviene comprobar hashes y fechas.
- Los pesos bajo `models/` son conversiones y cuantizaciones propias (int8 ConvRot, W6A8, W4A8), por lo que puede haber perdida de calidad respecto a los pesos originales en bf16.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad para las familias generativas incluidas.
- El repositorio no documenta requisitos de hardware ni rendimiento; el dimensionado debe hacerse por modelo.
- La descarga automatica requiere `features.network: true`; en entornos sin red o con politicas estrictas hay que descargar manualmente y respetar la estructura de carpetas de `ComfyUI/models`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WAS/was-node-suite-weights
- WAS Node Suite (GitHub): https://github.com/WASasquatch/was-node-suite-comfyui
- SCUNet: https://github.com/cszn/SCUNet
- NAFNet: https://github.com/megvii-research/NAFNet
- HDRCNN: https://github.com/gabrieleilertsen/hdrcnn
- HVI-CIDNet: https://github.com/Fediory/HVI-CIDNet
- Retinexformer: https://github.com/caiyuanhao1998/Retinexformer
- DarkIR: https://github.com/cidautai/DarkIR
- BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- BEN2: https://huggingface.co/PramaLLC/BEN2
- FlowSeek: https://github.com/mattpoggi/flowseek
