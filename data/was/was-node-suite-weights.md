# WAS/was-node-suite-weights

## Resumen

WAS Node Suite weights es un repositorio de pesos agregados que da soporte a la suite de nodos personalizados WAS Node Suite para ComfyUI. No se trata de un modelo entrenado por su autor, sino de una recopilación centralizada de checkpoints de terceros que la suite necesita en tiempo de ejecución: denoising, mejora de escenas con poca luz, reconstrucción HDR, eliminación de fondo, flujo óptico y modelos generativos de imagen y vídeo. El objetivo es evitar que los nodos dejen de funcionar cuando una copia externa de un peso se mueve o se elimina.

El repositorio mezcla formatos y orígenes: algunos ficheros son copias byte a byte de los checkpoints originales, otros están convertidos a safetensors y las familias bajo `models/` son conversiones y cuantizaciones propias para ComfyUI de publicaciones upstream. Destacan Kandinsky 6 (vídeo con audio, con transformadores en int8 ConvRot y W6A8) y BluePixel-Turbo para edición de imagen en 4K (bf16, int8 ConvRot, W6A8 y W4A8, más su autoencoder DC-AE). El repositorio ocupa 221,3 GB y acumula 1391 descargas.

La relevancia actual es práctica: centraliza dependencias dispersas de un ecosistema de nodos muy usado en flujos de postprocesado y restauración de imagen, con un esquema de licencias por fichero que respeta la licencia de cada obra original. No es un modelo de lenguaje ni un modelo multimodal de propósito general; es infraestructura de pesos para pipelines de difusión y restauración en ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto heterogéneo: CNN de restauración, transformers de difusión, autoencoders) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 ConvRot, W6A8, W4A8 (solo en las familias de `models/`); el resto en precisión original |
| Idiomas soportados | no disponible |
| Licencia | per-file (cada fichero conserva la licencia de su obra original; Apache-2.0, MIT, BSD-3-Clause y otras; Kandinsky 6 audio VAE y BluePixel transformers solo uso no comercial) |
| Formato de pesos | safetensors, .pth, .pt |

## Arquitectura y entrenamiento

No existe un entrenamiento propio: el repositorio empaqueta pesos ya entrenados por terceros. La composición es heterogénea. En `denoise/` se incluyen SCUNet (Kai Zhang) y NAFNet en anchos 32 y 64 (Megvii Research), redes convolucionales para eliminación de ruido. En `low_light/` conviven HVI-CIDNet (cuatro variantes), Retinexformer (nueve checkpoints para distintos datasets: NTIRE, LOL v1, LOL v2 real y sintético, FiveK, SID, SMID, SDSD indoor y outdoor) y DarkIR-M. En `hdr/` está HDRCNN de Gabriel Eilertsen, convertido a safetensors para inferencia nativa en ComfyUI.

El resto de familias son más pesadas. `birefnet/` incluye diez variantes de BiRefNet (General, General-HR, General-dynamic, General-reso_512, DIS, DIS-TR_TEs, COD, HRSOD, Matting-HR y Portrait) para segmentación y matting; `ben2/` aporta BEN2-base. `optical_flow/` contiene dos checkpoints de FlowSeek (T_CT y T_TartanCT_TSKH) convertidos a safetensors sin alterar tensores, cada uno con los pesos de Depth Anything V2 Small que FlowSeek usa para leer profundidad. `models/kandinsky6/` y `models/bluepixel/` son conversiones y cuantizaciones para ComfyUI de publicaciones upstream, con transformadores en int8 ConvRot, W6A8 y, en BluePixel, también W4A8. No se documentan tokens de entrenamiento, composición de dataset ni etapas de RLHF/DPO porque el autor no entrena ningún componente.

## Capacidades

- Eliminación de ruido en imágenes mediante SCUNet y NAFNet (anchos 32 y 64), integrada en el nodo Power Preprocessor.
- Mejora de imágenes con poca luz con HVI-CIDNet, Retinexformer y DarkIR, con variantes especializadas por dataset (SID, SMID, SDSD, FiveK, LOL).
- Reconstrucción HDR con HDRCNN a través del nodo HDR Reconstruct.
- Eliminación de fondo y matting de alta resolución con BiRefNet (diez variantes, incluidas Portrait y Matting-HR) y BEN2.
- Estimación de flujo óptico para vídeo con FlowSeek, apoyada en Depth Anything V2 Small para la profundidad.
- Generación de vídeo con audio mediante Kandinsky 6, con transformadores cuantizados y VAE de audio.
- Edición de imagen en 4K con BluePixel-Turbo, en bf16 e int8/W6A8/W4A8, con su autoencoder DC-AE.
- Descarga automática de dependencias: con `features.network: true` en `config.yaml`, la suite obtiene el fichero necesario la primera vez que un nodo lo requiere.
- No dispone de tool calling, razonamiento multi-step ni capacidades de lenguaje: no es un modelo conversacional.

## Casos de uso

- Restauración de fotografía nocturna en un pipeline de revelado: se aplica Retinexformer o HVI-CIDNet sobre la toma original antes de la etapa de generación, aprovechando los checkpoints específicos por sensor o dataset para reducir el ruido sin perder color.
- Limpieza previa a un upscale generativo: SCUNet o NAFNet eliminan ruido y artefactos de compresión antes de pasar la imagen a un modelo de difusión, lo que evita que el generador amplifique el grano.
- Reconstrucción de rango dinámico en tomas de interiores: HDRCNN recupera detalle en altas luces y sombras a partir de una única exposición, útil para inmobiliaria y arquitectura.
- Recorte automático de producto para catálogos de comercio electrónico: BiRefNet General-HR o Matting-HR generan máscaras de alta resolución aptas para composición sobre fondos limpios.
- Retrato y sustitución de fondo en estudio: la variante Portrait de BiRefNet está pensada para cabello y contornos finos, y BEN2-base sirve como alternativa ligera.
- Postproducción de vídeo con estabilización o interpolación asistida: los checkpoints de FlowSeek calculan flujo óptico entre fotogramas dentro del nodo Video Motion Model Loader, con la profundidad de Depth Anything V2 Small disponible en el mismo fichero.
- Generación de clips cortos con sonido sincronizado: Kandinsky 6, cargado con Load Diffusion Model y sus nodos propios, produce vídeo con pista de audio usando los transformadores cuantizados para reducir requisitos de memoria.
- Edición de imágenes en 4K dentro de ComfyUI: BluePixel-Turbo con sus cuantizaciones W4A8 permite trabajar a esa resolución en GPUs con VRAM limitada, usando el DC-AE para codificar y decodificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible de forma agregada; depende de cada submodelo. Las familias bajo `models/` incluyen cuantizaciones (int8 ConvRot, W6A8, W4A8) precisamente para reducir el consumo frente a bf16.
- GPU recomendadas: no disponibles en la información proporcionada. Para las familias pesadas (Kandinsky 6, BluePixel-Turbo) se recomienda consultar la documentación upstream; los denoisers y modelos de restauración son comparativamente ligeros.
- GPU de consumo: los modelos de restauración, segmentación y flujo óptico (SCUNet, NAFNet, BiRefNet, BEN2, FlowSeek) son los candidatos realistas para GPUs de consumo; las variantes cuantizadas de Kandinsky 6 y BluePixel están pensadas para reducir el requisito, pero no se especifica cifra.
- Despliegue: ComfyUI es el entorno objetivo. El repositorio está etiquetado como `diffusion-single-file`, y las carpetas de `models/` replican la estructura de `ComfyUI/models` para copiarse a mano. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo único, sino un agregador de pesos de restauración, segmentación, flujo óptico y generación; no existe una categoría comparable directa. Como referencia de alternativas por función, cada componente tiene su propio upstream: SCUNet y NAFNet para denoising, BiRefNet y BEN2 para segmentación, Retinexformer y HVI-CIDNet para poca luz, y Kandinsky 6 o BluePixel para generación y edición. La ventaja diferencial de este repositorio no es el rendimiento, sino la disponibilidad estable y centralizada de esos pesos con licencias documentadas por fichero.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier problema de calidad es atribuible al checkpoint upstream correspondiente, no a este repositorio.
- Licencia `per-file`: es obligatorio revisar la licencia de cada fichero antes de uso comercial. El VAE de audio de Kandinsky 6 y los transformadores de BluePixel son solo para uso no comercial.
- El repositorio pesa 221,3 GB; la descarga completa no es práctica y conviene bajar solo las carpetas necesarias.
- Las carpetas bajo `models/` no se descargan automáticamente: deben copiarse a mano en la ruta correspondiente de `ComfyUI/models`.
- Las conversiones a safetensors y las cuantizaciones int8 ConvRot, W6A8 y W4A8 son trabajo de este proyecto y pueden introducir diferencias numéricas frente al original en bf16.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero los modelos generativos incluidos (Kandinsky 6, BluePixel) pueden producir contenido sintético inexacto o artefactos.
- Sesgos: no documentados en la información disponible; los datasets de entrenamiento de cada upstream condicionan el comportamiento en piel, iluminación y escenas no representadas.
- Idiomas: no disponibles; la mayoría de componentes no procesa texto.
- Sin garantías de mantenimiento ni de paridad con futuras versiones de ComfyUI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WAS/was-node-suite-weights
- WAS Node Suite para ComfyUI: https://github.com/WASasquatch/was-node-suite-comfyui
- SCUNet: https://github.com/cszn/SCUNet
- NAFNet: https://github.com/megvii-research/NAFNet
- HDRCNN: https://github.com/gabrieleilertsen/hdrcnn
- HVI-CIDNet: https://github.com/Fediory/HVI-CIDNet
- Retinexformer: https://github.com/caiyuanhao1998/Retinexformer
- DarkIR: https://github.com/cidautai/DarkIR
- BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- BEN2: https://huggingface.co/PramaLLC/BEN2
- FlowSeek: https://github.com/mattpoggi/flowseek
