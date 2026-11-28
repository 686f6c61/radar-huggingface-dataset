# zkwr1081/Moss-image-gouache-lora

## Resumen

Moss-image-gouache-lora es un adaptador LoRA de bajo rango para generacion de imagenes texto-a-imagen, desarrollado por el usuario zkwr1081 y publicado bajo licencia Apache 2.0. Se trata de un adaptador de estilo que se monta sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT (y es compatible tambien con MOSS-Image-Base), y su funcion es transferir un estilo ilustrativo concreto: gouache vintage colorido, con formas pictoricas, color editorial calido, formas simplificadas y composiciones ilustrativas atrevidas.

El modelo no es un modelo fundacional autonomo, sino un adaptador de 504 tensores LoRA (aproximadamente 70,93 MiB en su variante para ComfyUI) que modifica el comportamiento del transformer del modelo base. Su relevancia radica en que permite obtener un estilo artistico muy definido sin reentrenar el modelo completo, con un consumo de almacenamiento minimo (el repositorio ocupa 0,2 GB) y una integracion directa en flujos Diffusers y ComfyUI.

La informacion disponible sobre el modelo es limitada: se trata de un adaptador de estilo sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento mas alla de los parametros de inferencia recomendados. La ficha refleja esta escasez de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de difusion (modelo base MOSS-Image-SFT / MOSS-Image-Base) |
| Parametros totales | 504 tensores LoRA; numero de parametros no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion) |
| Tipos de cuantizacion | no disponible; existe conversion GGUF publicada por terceros |
| Idiomas soportados | no disponible (el prompt de texto se procesa en el idioma que soporte el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers/PEFT y variante rekeyada para ComfyUI); GGUF disponible en repositorio externo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el transformer del modelo de difusion MOSS-Image. Segun la model card, fue entrenado contra MOSS-Image-Base, que queda registrado como padre de entrenamiento en `adapter_config.json`, aunque sus objetivos en el transformer son compatibles con MOSS-Image-SFT, y la combinacion SFT + LoRA produjo los mejores resultados de evaluacion segun el autor. El checkpoint preferido es el de 1.500 pasos, seleccionado tras comparar los checkpoints 1.000, 1.500 y 2.000 a escalas 0,7, 1,0 y 1,2.

No se dispone de informacion sobre el dataset de entrenamiento (numero de imagenes, composicion, procedencia o proceso de curado), ni sobre si se emplearon tecnicas de RLHF, DPO u otras. La unica innovacion tecnica documentada es la publicacion de una variante rekeyada para ComfyUI: el archivo raiz `pytorch_lora_weights.safetensors` usa nombres de clave Diffusers/PEFT (`transformer.layers...`), mientras que la version para ComfyUI cambia solo el prefijo a `diffusion_model.layers...`, manteniendo formas, dtypes y valores de los tensores sin cambios. El script `scripts/convert_moss_lora_for_comfyui.py` documenta y reproduce esta conversion.

## Capacidades

- Generacion de imagenes texto-a-imagen con estilo gouache vintage: formas pictoricas, color editorial calido, formas simplificadas, escenas texturadas y composiciones ilustrativas atrevidas.
- Aplicacion de estilo mediante un token disparador (`moss_vgouache_style`) que debe colocarse al inicio del prompt.
- Compatibilidad con dos modelos base: MOSS-Image-SFT (preferido para inferencia) y MOSS-Image-Base.
- Integracion en Diffusers mediante el archivo LoRA raiz en formato PEFT.
- Integracion en ComfyUI nativo mediante el archivo rekeyado, con soporte a partir del commit `b1a247c`.
- Conversion GGUF para su uso con `stable-diffusion.cpp` a traves de un adaptador externo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vision mas alla de la generacion de imagen.

## Casos de uso

- Ilustracion editorial: el adaptador produce escenas con color calido y formas simplificadas adecuadas para articulos, reportajes o portadas con estetica vintage; se usaria con el token `moss_vgouache_style` al inicio del prompt y 30 pasos de inferencia a 1024 x 1024.
- Creacion de arte conceptual para videojuegos o animacion: permite explorar variaciones de un estilo gouache coherente sin reentrenar el modelo base, gracias a la ligereza del adaptador (0,2 GB de repositorio).
- Generacion de material promocional y redes sociales: composiciones atrevidas con mesas de comida, paisajes o retratos florales, como muestran los ejemplos de la model card (cafe, canon, mesa de verano, zorro rosa).
- Prototipado rapido en ComfyUI: al existir un archivo especifico con claves rekeyadas, se puede cargar con el loader LoRA estandar (model strength 1,0, CLIP strength 0,0) dentro de un flujo nativo de MOSS-Image.
- Experimentacion en Diffusers: investigadores que quieran estudiar la transferencia de estilo mediante LoRA sobre MOSS-Image pueden usar el adaptador como caso de referencia con hiperparametros documentados.
- Despliegue ligero en entornos con recursos limitados: la conversion GGUF para `stable-diffusion.cpp` permite ejecutar el estilo en configuraciones sin GPU de gama alta, aunque el rendimiento concreto no esta documentado.
- Generacion de ilustraciones para publicaciones impresas o fanzines: el estilo gouache encaja en maquetacion editorial y se puede controlar mediante prompts descriptivos detallados como los de los ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base MOSS-Image-SFT, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la existencia de una conversion GGUF para `stable-diffusion.cpp` sugiere que puede ejecutarse en entornos de menores recursos, pero no se confirma.
- Opciones de despliegue: Diffusers (archivo raiz PEFT), ComfyUI nativo (archivo rekeyado, commit `b1a247c` o superior), `stable-diffusion.cpp` mediante el adaptador GGUF externo.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 0,2 GB; el archivo LoRA para ComfyUI pesa 70,93 MiB con 504 tensores.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores LoRA de estilo gouache ni de modelos comparables sobre MOSS-Image, por lo que no es posible establecer una comparativa con parametros, contexto, rendimiento o licencia de alternativas.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no hay datos sobre dataset de entrenamiento, numero de parametros, benchmarks ni sesgos conocidos.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar composiciones incoherentes, anatomia incorrecta o texto ilegible en las imagenes, especialmente con prompts complejos.
- El adaptador esta disenado para un estilo concreto; fuera de ese estilo puede degradar la fidelidad al prompt o introducir el look gouache de forma no deseada.
- El token disparador `moss_vgouache_style` debe colocarse al inicio del prompt; su omision puede reducir o anular el efecto del estilo.
- En ComfyUI, cargar el archivo raiz Diffusers/PEFT directamente puede producir advertencias de `lora key not loaded`; es necesario usar el archivo rekeyado y actualizar ComfyUI al commit `b1a247c` o superior.
- La compatibilidad con MOSS-Image-Base esta documentada, pero el autor prefiere MOSS-Image-SFT para inferencia; los resultados pueden diferir entre ambos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT, que se distribuye por separado.
- No se documentan limitaciones de idioma del prompt; dependera del codificador de texto del modelo base.
- El adaptador GGUF y el modelo base GGUF son publicaciones de terceros (usuario axiomofmind), no del autor original, por lo que su mantenimiento y verificacion no estan garantizados por zkwr1081.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/zkwr1081/Moss-image-gouache-lora
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Conversion GGUF del adaptador (terceros): https://huggingface.co/axiomofmind/Moss-image-gouache-lora-GGUF
- Modelo base GGUF (terceros): https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
