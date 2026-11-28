# zkwr1081/Moss-image-beauty-lora

## Resumen

Moss-image-beauty-lora es un adaptador LoRA de tipo text-to-image desarrollado por el usuario zkwr1081 para la familia de modelos MOSS-Image de OpenMOSS. Su función es especializar el modelo base en fotografía de retrato y belleza editorial: primeros planos pulidos, iluminación suave y direccional, detalle de piel y cabello, y fondos contenidos. No es un modelo autónomo, sino un adaptador que se carga sobre MOSS-Image-SFT (preferido para inferencia) o MOSS-Image-Base, y que se activa mediante el token disparador `moss_beauty_style` colocado al inicio del prompt.

El adaptador se distribuye en formato Diffusers/PEFT (`pytorch_lora_weights.safetensors`) y también en una variante con claves renombradas para ComfyUI nativo (`MOSS-Image-Beauty-LoRA-ComfyUI.safetensors`), ambas con 504 tensores LoRA y unos 70,93 MiB. El repositorio raíz contiene el checkpoint original de 2.000 pasos entrenado sobre 176 imágenes; existe además un checkpoint alternativo de 1.750 pasos entrenado sobre un subconjunto más estrecho de 149 imágenes, bajo el directorio `alternative-checkpoint-1750/`. También hay una conversión GGUF alojada en un repositorio de terceros.

La relevancia del adaptador es acotada pero clara: permite obtener un estilo fotográfico de retrato consistente sobre MOSS-Image sin reentrenar el modelo base, con licencia Apache 2.0 y un tamaño reducido que facilita su integración en flujos de Diffusers y ComfyUI. No obstante, el repositorio no incluye información sobre arquitectura del modelo base, número de parámetros, contexto ni idiomas, y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image-SFT / MOSS-Image-Base; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (adaptador de 504 tensores LoRA; tamaño del archivo ~70,93 MiB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; existe conversión GGUF del adaptador en repositorio de terceros |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers/PEFT y variante ComfyUI nativa); GGUF en repositorio externo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el transformer de MOSS-Image. Según la model card, fue entrenado contra MOSS-Image-Base, que queda registrado como padre de entrenamiento en `adapter_config.json`, aunque sus objetivos en el transformer son compatibles con MOSS-Image-SFT, y la combinación SFT + LoRA produjo los mejores resultados de evaluación local. El checkpoint principal consta de 2.000 pasos de entrenamiento sobre 176 imágenes; el alternativo, de 1.750 pasos sobre 149 imágenes seleccionadas de la ejecución `moss-beauty-v3`. Ambos comparten el token disparador `moss_beauty_style`.

No se especifican en la información disponible la composición del dataset, el número de tokens de entrenamiento del modelo base, ni si hubo etapas de RLHF o DPO. La innovación técnica destacable del adaptador es la doble distribución de pesos: el archivo raíz usa nombres de clave de Diffusers/PEFT (`transformer.layers...`), mientras que la variante para ComfyUI reescribe el prefijo a `diffusion_model.layers...` para evitar advertencias de `lora key not loaded` en el cargador nativo. La model card indica además que la rekeying es únicamente de prefijo y que los pesos son idénticos.

## Capacidades

- Generación de imágenes text-to-image especializada en retratos en primer plano y fotografía de belleza editorial.
- Aplicación de un estilo fotográfico consistente mediante el token disparador `moss_beauty_style`.
- Control de iluminación suave y direccional, detalle de piel, cabello y labios, y fondos neutros o desenfocados.
- Compatibilidad con dos modelos base: MOSS-Image-SFT (preferido) y MOSS-Image-Base.
- Integración con Diffusers mediante `pytorch_lora_weights.safetensors` y con ComfyUI nativo mediante la variante rekeyed.
- Soporte de escala LoRA ajustable (1.0 recomendada; 0.7, 0.8 y 0.9 también evaluadas).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, al tratarse de un adaptador de generación de imágenes.

## Casos de uso

- Retratos editoriales para publicaciones: el adaptador produce primeros planos pulidos con iluminación suave y fondos contenidos, adecuados para maquetación de revistas o catálogos de belleza, usando 30 pasos, guidance 3.0 y resolución 1024x1024.
- Pruebas de concepto de fotografía de belleza: permite generar variaciones de un mismo estilo (piel clara u oscura, pecas, distintas expresiones) manteniendo coherencia estética gracias al token `moss_beauty_style` y a la escala LoRA fija en 1.0.
- Generación de avatares y retratos de perfil: con prompts que describen rasgos concretos (color de ojos, peinado, prenda) se obtienen retratos neutros y bien iluminados aptos para fichas de personaje o material de marketing.
- Integración en pipelines de Diffusers: el adaptador se descarga y carga con `hf_hub_download` y se aplica sobre MOSS-Image-SFT, lo que facilita su uso en scripts de generación por lotes para producción de imágenes de catálogo.
- Flujos de trabajo en ComfyUI: mediante el archivo `MOSS-Image-Beauty-LoRA-ComfyUI.safetensors` y el cargador LoRA estándar (model strength 1.0, CLIP strength 0.0) se puede incorporar el estilo a grafos nodales existentes sin reescribir el pipeline.
- Experimentación con cuantización GGUF: la conversión GGUF del adaptador, junto con MOSS-Image-SFT-GGUF, permite probar el estilo en entornos con recursos limitados, aunque no se documentan requisitos ni rendimiento de esa ruta.
- Comparación de checkpoints: los dos checkpoints (2.000 pasos/176 imágenes y 1.750 pasos/149 imágenes) permiten evaluar el compromiso entre amplitud del dataset y foco estilístico en un mismo flujo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base MOSS-Image-SFT o MOSS-Image-Base, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible para el adaptador; la model card no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no disponible. El adaptador pesa ~70,93 MiB, pero el modelo base condiciona la viabilidad en GPU consumer.
- Opciones de despliegue: Diffusers (flujo documentado con `hf_hub_download`), ComfyUI nativo (commit `b1a247c` o superior) y ruta GGUF mediante MOSS-Image-SFT-GGUF en un repositorio de terceros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moss-image-beauty-lora | LoRA sobre MOSS-Image | 504 tensores LoRA (~70,93 MiB) | No disponible | Apache 2.0 | Hugging Face, Diffusers y ComfyUI |
| MOSS-Image-SFT | Modelo base text-to-image | No disponible | No disponible | No disponible en la información | Hugging Face (OpenMOSS-Team) |
| MOSS-Image-Base | Modelo base text-to-image | No disponible | No disponible | No disponible en la información | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al especializarse en retratos de belleza, puede reproducir sesgos estéticos y de representación presentes en las 176 imágenes de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir rasgos faciales inconsistentes, manos deformadas o detalles de piel irreales, especialmente fuera de la configuración recomendada.
- Limitaciones de contexto e idioma: no se especifican; el adaptador no documenta soporte multilingüe ni longitud de prompt máxima.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-SFT/Base tiene su propia licencia, no detallada en la información proporcionada, que debe verificarse por separado.
- Compatibilidad de formato: el archivo raíz usa claves Diffusers/PEFT y no debe cargarse directamente en ComfyUI nativo; para ello hay que usar la variante rekeyed, o se producirán advertencias de `lora key not loaded`.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere MOSS-Image-SFT (preferido) o MOSS-Image-Base, y sus resultados dependen de la versión y del pipeline de estos.
- Configuración sensible: la model card recomienda escala 1.0, 30 pasos, guidance 3.0, resolución 1024x1024 y prompt negativo vacío; desviarse puede degradar la fidelidad al prompt o el estilo aprendido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-beauty-lora
- Modelo base preferido (MOSS-Image-SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base alternativo (MOSS-Image-Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Conversión GGUF del adaptador: https://huggingface.co/axiomofmind/Moss-image-beauty-lora-GGUF
- Modelo base en GGUF: https://huggingface.co/axiomofmind/MOSS-Image-SFT-GGUF
