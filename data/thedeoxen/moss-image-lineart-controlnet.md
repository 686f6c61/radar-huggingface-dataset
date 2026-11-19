# thedeoxen/MOSS-Image-lineart-controlnet

## Resumen

MOSS-Image-lineart-controlnet es un adaptador LoRA de tipo ControlNet para el modelo de generacion y edicion de imagenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen. Resuelve un problema concreto: imponer la estructura de un dibujo de lineas (lineart) sobre la generacion, de modo que el modelo siga los contornos de una imagen de control mientras el prompt de texto define identidad, materiales, ropa, color e iluminacion. No es un ControlNet completo ni el adaptador oficial de concatenacion color/profundidad de MOSS, sino una LoRA que se comporta como un ControlNet.

El adaptador se entrena como adaptador de edicion: la imagen de control actua como referencia y el prompt describe la escena a generar. La LoRA tiene rango 64 en capas lineales y rango 16 en convoluciones, y el checkpoint publicado corresponde al paso de entrenamiento 5000. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y un workflow de ComfyUI incluido, y esta pensado para el modelo base OpenMOSS-Team/MOSS-Image-SFT.

Su relevancia practica esta en el flujo de trabajo: permite colorear dibujos, transformar fotos en escenas nuevas conservando la estructura de lineas y dirigir disenos por el trazo en lugar de por la iluminacion. El repositorio ocupa 0,3 GB y acumula 2287 descargas, lo que indica un uso activo dentro de la comunidad de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador tipo ControlNet) sobre el UNet de MOSS-Image-SFT; rango 64 en capas lineales, rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para la LoRA; el modelo base se usa con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder w4a8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_lineart_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA aplicada al UNet del modelo base MOSS-Image-SFT, con rango 64 en las capas lineales y rango 16 en las convoluciones. Se entrena como adaptador de edicion: la imagen de control (un dibujo de lineas blancas sobre fondo negro) se pasa como unica imagen de referencia a traves del nodo Text Encode MOSS-Image Edit, y el prompt de texto describe la imagen objetivo. El checkpoint publicado es el paso 5000 de entrenamiento.

El entrenamiento se realizo con la cache KV activada, lo que obliga a configurar el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa durante la inferencia. Los mapas de control de entrenamiento se generaron con el preprocesador Realistic Lineart en modo coarse, con lineas blancas sobre negro; lineas dispersas y finas se ajustan mejor a la distribucion de entrenamiento que un boceto denso. El prompt negativo usado en las muestras de entrenamiento es `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`.

## Capacidades

- Control estructural por lineart: sigue los contornos de un dibujo de lineas limpias, sin el ruido adicional de un mapa Canny crudo.
- Generacion guiada por prompt: identidad, materiales, ropa, color, iluminacion y entorno se definen mediante texto, no mediante la imagen de control.
- Edicion image-to-image: la imagen de control se pasa como referencia unica en el nodo Text Encode MOSS-Image Edit.
- Compatibilidad con ComfyUI: incluye workflow (`moss_image_lineart_control.json`) con carga de foto, construccion del mapa de control, codificacion y muestreo.
- Ajuste de rigidez del control: la fuerza de la LoRA puede bajarse hacia 0.7 si el control resulta demasiado estricto; 1.0 es el valor entrenado.
- Sin trigger word: no requiere palabra de activacion.
- Capacidades del modelo base (MOSS-Image-SFT): generacion y edicion de imagenes con text encoder Qwen3.5 9B y VAE flux2; el adaptador hereda el soporte de idioma ingles.

## Casos de uso

- Coloreado de dibujos lineales: se introduce un lineart blanco sobre negro como imagen de control y un prompt que describa paleta, materiales e iluminacion; el modelo rellena la escena respetando los contornos del dibujo.
- Conversion de foto a escena nueva: se extrae el lineart de una fotografia con Realistic Lineart coarse y se genera una escena distinta que conserva la estructura de lineas de la original, util para variaciones de vestuario, epoca o ambientacion.
- Bocetos de diseno de producto o personaje: el trazo dirige la composicion mientras el prompt fija materiales y acabados, adecuado para iterar sobre disenos donde la forma debe mantenerse estable.
- Previsualizacion de concept art: a partir de un boceto rapido se generan varias propuestas con prompts distintos, manteniendo la silueta y la composicion del dibujo original.
- Integracion en pipelines de ComfyUI: el workflow incluido permite montar un nodo de control de lineart en produccion de imagenes por lotes, con ajustes fijos de 30 pasos, CFG 4, sampler euler y scheduler simple.
- Ilustracion editorial y storyboard: se parte de un lineart de encuadre y se generan variantes de escena con coherencia estructural, reduciendo el trabajo de redibujado manual.
- Prototipado de vestuario y atrezzo sobre una pose fija: el lineart define la pose y el prompt define prendas y tejidos, util para equipos de diseno que necesitan multiples variantes sobre la misma silueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base se distribuye en el flujo recomendado con UNet int8 y text encoder w4a8 GPTQ, lo que reduce los requisitos frente a pesos en precision completa, pero no se especifican cifras de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el uso de cuantizacion int8 en el UNet y w4a8 en el text encoder sugiere que el flujo esta pensado para reducir huella de memoria, pero no se detalla en que tarjetas cabe.
- Opciones de despliegue: ComfyUI (flujo documentado con el workflow incluido y el nodo Text Encode MOSS-Image Edit); la libreria declarada es diffusers, por lo que la carga via diffusers es posible, aunque el flujo detallado en la model card es el de ComfyUI.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 0,3 GB (solo la LoRA y el workflow).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-lineart-controlnet | LoRA tipo ControlNet sobre MOSS-Image-SFT | no disponible | no disponible | apache-2.0 | Hugging Face, 2287 descargas |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de generacion/edicion de imagenes | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Adaptador oficial color/depth de MOSS | Adaptador de concatenacion oficial | no disponible | no disponible | no disponible en la informacion proporcionada | Mencionado en la model card, sin enlace |
| ControlNet estandar para modelos diffusion | ControlNet completo | no disponible | no disponible | depende del modelo | Ecosistema diffusers/ComfyUI |

La comparacion cuantitativa con alternativas no esta disponible: la informacion proporcionada no incluye parametros, contexto ni metricas de los modelos comparables. La diferencia funcional documentada es que este adaptador es una LoRA que se comporta como ControlNet, no un ControlNet completo ni el adaptador oficial de concatenacion de MOSS.

## Limitaciones y advertencias

- Solo soporta ingles como idioma declarado; los prompts en otros idiomas no estan cubiertos por la model card.
- Depende estrictamente del modelo base OpenMOSS-Team/MOSS-Image-SFT y de su flujo de carga concreto (UNet int8, text encoder Qwen3.5 9B w4a8 GPTQ, VAE flux2); no es un adaptador generico.
- Requiere configurar el formato de edicion `ai-toolkit` en la codificacion positiva y negativa; omitirlo degrada el resultado porque la LoRA se entreno con cache KV activada.
- Funciona mejor con lineas blancas dispersas sobre negro generadas con Realistic Lineart en modo coarse; lineas densas o de grosor alto se alejan de la distribucion de entrenamiento.
- Riesgo de rigidez excesiva del control: si el resultado queda demasiado apegado al trazo, hay que bajar la fuerza de la LoRA hacia 0.7.
- Riesgo de alucinacion visual y de artefactos propios del modelo base; el prompt negativo de referencia incluye `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del conjunto depende tambien de la licencia del modelo base MOSS-Image-SFT, que no se detalla en la informacion proporcionada.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet
- Pesos de la LoRA: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_sft_lineart_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_lineart_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
