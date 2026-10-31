# Spectrallic/MOSS-Image-Base-8step-DMD-int8-convrot

## Resumen

MOSS-Image-Base-8step-DMD-int8-convrot es un checkpoint de generación de imágenes a partir de texto (text-to-image) creado por el usuario Spectrallic. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado: combina el transformador base MOSS-Image-Base del equipo OpenMOSS-Team con la LoRA de destilación DMD de 8 pasos de lodestones, fusionada directamente en los pesos, y cuantiza el resultado a INT8 con rotación convolucional (ConvRot) siguiendo el formato de cuantización de ComfyUI.

El problema que resuelve es de eficiencia y comodidad de despliegue. Por un lado, la destilación DMD (Distribution Matching Distillation) integrada permite generar imágenes en 8-10 pasos con CFG 1, frente a los muchos pasos que requiere el modelo base. Por otro, al ir la LoRA fusionada, el usuario no necesita cargar un cargador de LoRA adicional: el archivo es un reemplazo directo ("drop-in") del checkpoint `moss_image_base_int8_convrot.safetensors` oficial de Comfy-Org, con los mismos nombres de tensores, tipos, formas y formato de cuantización.

El modelo ocupa 5,4 GB en el repositorio, se distribuye como archivo único safetensors para la librería diffusion-single-file, está pensado para ComfyUI (y cargadores compatibles como Nox), y se publica bajo licencia Apache-2.0. Es relevante para quien quiera inferencia rápida de MOSS-Image en hardware de consumo sin la sobrecarga de gestionar LoRAs aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusion text-to-image (MOSS-Image-Base) con destilacion DMD fusionada |
| Parametros totales | no disponible (el checkpoint pesa 5,4 GB en INT8/BF16 mixto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (row-wise absmax, rotacion Hadamard por grupos de 256) en las 168 lineales de los bloques; resto en BF16 |
| Idiomas soportados | no disponible (el codificador de texto usado en los ejemplos es Qwen3.5-9B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo unico, libreria diffusion-single-file, layout Comfy-Org) |

## Arquitectura y entrenamiento

El modelo parte del transformador oficial MOSS-Image-Base en BF16, al que se le fusiona la LoRA de destilacion DMD de 8 pasos (rango 128, alpha 128, checkpoint update 12000 con EMA, no la variante `lora_dmd2`). La fusion se realiza en FP32 calculando `W' = W + (alpha/rank) · up @ down` y aplicandola a cada bloque en las proyecciones `proj.{q,k,v,o,ffn_up_gate,ffn_down}`. Tras la fusion, las proyecciones de atencion se concatenan en un unico tensor `layers.N.proj.qkv`, replicando el layout del checkpoint de referencia de Comfy-Org.

La cuantizacion se realizo con la herramienta convert_to_quant v1.3.4 en modo `--comfy_quant --int8`: solo las 168 lineales de los bloques (`proj.qkv`, `proj.o`, `ffn_up_gate`, `ffn_down`) se cuantizan a INT8 con escalas row-wise absmax tras una rotacion regular de Hadamard por grupos de 256 (tecnica ConvRot, que reduce errores de cuantizacion en atencion). El resto de tensores permanece en BF16, igual que en el archivo oficial. Los marcadores `comfy_attention.config` se copian del checkpoint de referencia para mantener compatibilidad.

Sobre el entrenamiento del modelo base y de la LoRA de destilacion (datos, numero de tokens o imagenes, tecnica DMD concreta), no se ha publicado informacion en la model card; la LoRA de destilacion es, segun el autor, un trabajo en progreso aguas arriba.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) en muy pocos pasos: los ejemplos oficiales usan 8 y 10 pasos con CFG 1.0 y prompt negativo vacio.
- Destilacion DMD integrada: no requiere LoRA loader ni ajustes adicionales de pasos altos de muestreo.
- Compatibilidad total con el layout de cuantizacion INT8 ConvRot de Comfy-Org (nombres de tensores, dtypes y formas identicos), lo que permite usarla como reemplazo directo en ComfyUI y en cargadores compatibles como Nox.
- Muestreo con Euler flow sobre la plancha de sigmas de la release (shift 5), segun los ejemplos documentados.
- Resoluciones de salida de hasta 1536×1536 en los ejemplos publicados (tambien 1056×1408).
- Uso del codificador de texto `qwen3.5_9b_int8_convrot` de Comfy-Org/MOSS-Image.
- No hay evidencia documentada de capacidades de edicion de imagen, image-to-image, audio o vision mas alla del pipeline text-to-image.

## Casos de uso

- Generacion de imagenes en ComfyUI con flujos rapidos: al estar la destilacion de 8 pasos fusionada, se pueden construir workflows de pocas iteraciones con CFG 1 sin gestionar LoRAs, reduciendo el tiempo por imagen de forma sustancial frente al modelo base.
- Inferencia en GPU de consumo: la cuantizacion INT8 con ConvRot reduce la huella de memoria del transformador (5,4 GB el archivo unico), lo que lo hace viable en tarjetas con VRAM limitada.
- Automatizacion y pipelines de generacion por lotes: al ser un archivo unico con layout estandarizado, se integra facilmente en scripts de generacion masiva (diseño conceptual, moodboards, variaciones de prompts) sin pasos de post-carga de adaptadores.
- Prototipado creativo de ilustracion digital: los ejemplos muestran buen manejo de escenas complejas (ciudades flotantes, arquitectura detallada, paletas pastel) en formato pintura digital y composiciones realistas.
- Sustitucion directa en despliegues existentes: si ya se usa `moss_image_base_int8_convrot.safetensors` de Comfy-Org, este checkpoint sustituye al archivo sin cambiar el workflow, anadiendo la aceleracion por destilacion.
- Uso en motores de inferencia alternativos compatibles con el layout Comfy-Org, como Nox, cargando el archivo tal cual sin configuracion extra.
- Experimentacion con destilacion few-step: al ser Apache-2.0 y documentar el proceso de fusion y cuantizacion, sirve como referencia para crear derivados cuantizados de otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento documentados son cualitativos: generacion en 8-10 pasos con CFG 1.0 y muestreador Euler flow (shift 5), frente al numero de pasos (no disponible) del modelo base sin destilar.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; el archivo del transformador pesa 5,4 GB (mixto INT8/BF16), a lo que hay que sumar el codificador de texto `qwen3.5_9b_int8_convrot` (tambien INT8) y la VRAM de activacion. Una GPU con 8-12 GB de VRAM es un punto de partida razonable, pero es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible oficialmente; por el tamaño del checkpoint, tarjetas consumer tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 deberian ejecutarlo sin problemas. No hay datos publicados sobre GPUs de datacenter.
- Cabe en GPU consumer: si, con alta probabilidad, gracias a la cuantizacion INT8 y al tamaño de 5,4 GB, aunque sin cifras oficiales.
- Despliegue: ComfyUI (destino principal, formato comfy_quant), Nox (noxengine.dev, carga el archivo tal cual) y cualquier cargador compatible con el layout INT8 ConvRot de Comfy-Org. No hay soporte documentado para vLLM, TGI, Ollama o diffusers (al ser un modelo de difusion en formato single-file).
- Latencia y throughput: no disponibles; la destilacion a 8 pasos implica un numero de evaluaciones del modelo por imagen muy reducido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Formato | Destilacion | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Spectrallic/MOSS-Image-Base-8step-DMD-int8-convrot | safetensors single-file | DMD 8 pasos fusionada | INT8 ConvRot (bloques) + BF16 | Apache-2.0 | Reemplazo directo del checkpoint Comfy-Org, sin LoRA loader |
| OpenMOSS-Team/MOSS-Image-Base | BF16 (multi-archivo) | No | No | Apache-2.0 | Modelo base oficial; requiere mas pasos y LoRA aparte para few-step |
| Comfy-Org/MOSS-Image (`moss_image_base_int8_convrot`) | safetensors single-file | No (requiere LoRA aparte) | INT8 ConvRot + BF16 | Apache-2.0 | Layout de referencia; este derivado replica su formato exactamente |
| lodestones/MOSS-Image-Base-8-steps-dmd | LoRA (safetensors) | DMD 8 pasos (adaptador) | No | Apache-2.0 | Destilacion original; en progreso, puede haber updates mas recientes |

## Limitaciones y advertencias

- La LoRA de destilacion DMD upstream es un trabajo en progreso: este checkpoint esta congelado en el update 12000 (EMA) y puede quedar desactualizado respecto a versiones mas recientes de lodestones.
- La cuantizacion INT8 (aunque mitigada por la rotacion Hadamard) puede introducir una ligera degradacion de calidad respecto al modelo BF16 sin cuantizar; no hay evaluaciones cuantitativas publicadas de esta degradacion.
- Solo las 168 lineales de los bloques estan cuantizadas; el resto esta en BF16, por lo que la huella de memoria no es la minima posible.
- El layout de tensores es especifico: usa `proj.qkv` fusionado y tensores `.comfy_quant` por capa. Cargadores que esperen layouts con `proj.q/k/v` separados no funcionaran sin adaptacion.
- No hay datos de benchmarks, sesgos, seguridad o calidad de prompts publicados para este derivado ni, en la model card, para el modelo base.
- Sesgos y riesgo de alucinacion visual: no disponible explicitamente; como todo modelo text-to-image, puede reproducir sesgos de sus datos de entrenamiento y no seguir fielmente prompts complejos, pero no hay documentacion al respecto.
- Idiomas del codificador de texto: no disponible; los prompts de ejemplo estan en ingles y el rendimiento con otros idiomas no esta documentado.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con atribucion y conservacion del aviso de licencia.
- Descargas y adopcion muy bajas (196 descargas, 1 like en el momento de la ficha), por lo que el soporte comunitario es limitado.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/Spectrallic/MOSS-Image-Base-8step-DMD-int8-convrot
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA de destilacion DMD 8 pasos: https://huggingface.co/lodestones/MOSS-Image-Base-8-steps-dmd
- Checkpoint de referencia Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Herramienta de cuantizacion: https://github.com/silveroxides/convert_to_quant
- Motor de inferencia Nox: https://noxengine.dev/
