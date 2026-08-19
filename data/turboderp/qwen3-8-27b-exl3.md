# turboderp/Qwen3.8-27B-exl3

## Resumen

Este repositorio contiene cuantizaciones EXL3 del modelo Qwen3.8-27B, preparadas por el usuario turboderp. EXL3 es un formato de cuantización optimizado para la biblioteca de inferencia exllamav3, que permite ejecutar modelos de gran tamaño con un consumo de VRAM reducido. Se ofrecen ocho niveles de cuantización, desde 2.00 hasta 6.00 bits por peso, lo que da flexibilidad para ajustar el equilibrio entre calidad y requisitos de memoria.

La relevancia de este proyecto radica en que facilita el despliegue de un modelo de 27 mil millones de parámetros en hardware de consumo o en entornos con GPUs limitadas, manteniendo una degradación controlada de la precisión. El modelo base Qwen3.8-27B pertenece a la familia Qwen3 de Alibaba, aunque no se proporcionan detalles adicionales sobre su arquitectura o entrenamiento en esta ficha.

La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para integraciones en producción. Sin embargo, al ser una cuantización, se debe considerar la pérdida de fidelidad respecto al modelo original, especialmente en los niveles de bits más bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27B (segun el nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2.00, 2.50, 3.00, 3.50, 4.00, 5.00 y 6.00 bits por peso |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion de este repositorio. Se trata de una cuantizacion posterior al entrenamiento, realizada por turboderp, que comprime los pesos del modelo original utilizando el formato EXL3. Este formato emplea una combinacion de cuantizacion por grupos y escalado por canales, optimizado para la inferencia con exllamav3 en GPUs NVIDIA. No se mencionan datos sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF, DPO, etc.) del modelo base.

## Capacidades

- No se han documentado capacidades especificas en la informacion proporcionada.
- Al ser una cuantizacion del modelo Qwen3.8-27B, se espera que herede las capacidades del modelo original (generacion de texto, razonamiento, codigo, etc.), pero no se confirma en esta ficha.
- Se recomienda consultar la ficha del modelo base [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) para conocer sus capacidades detalladas.

## Casos de uso

- No se pueden enumerar casos de uso concretos sin conocer las capacidades reales del modelo base. La informacion disponible solo cubre el proceso de cuantizacion.
- Como guia general, un modelo de 27B cuantizado a 4 bits podria emplearse en tareas de generacion de texto, asistencia conversacional o generacion de codigo en entornos con VRAM limitada (por ejemplo, una RTX 3090 o 4090).
- La flexibilidad de elegir entre 2 y 6 bits por peso permite adaptar el despliegue a distintos presupuestos de memoria, priorizando velocidad o calidad segun las necesidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las imagenes incluidas en la model card muestran graficas de divergencia KLD frente a VRAM para cada nivel de cuantizacion, pero no se proporcionan valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- EXL3 esta disenado para GPUs NVIDIA con soporte CUDA (exllamav3 no funciona en AMD o Apple Silicon).
- El tamano total del repositorio es de 112 GB, que incluye todos los quants. El peso de cada cuantizacion individual no se especifica, pero se puede estimar a partir de los bits por peso y los 27B parametros: a 2.00 bpw serian ~6.75 GB, a 4.00 bpw ~13.5 GB y a 6.00 bpw ~20.25 GB (estimaciones teoricas, sin confirmar).
- Para ejecutar el quant de 4.00 bpw se necesitaria una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB).
- El quant de 2.00 bpw podria caber en GPUs con 8-10 GB de VRAM, aunque con una perdida de calidad significativa.
- Opciones de despliegue: exllamav3 (biblioteca nativa), o mediante servidores como text-generation-inference si soportan EXL3. No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparacion con otros modelos de tamano similar (por ejemplo, Llama 3 8B, Mistral 7B, etc.) en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision, especialmente en niveles de 2.00 y 2.50 bits por peso. Esto puede manifestarse en alucinaciones, errores de razonamiento o degradacion de la calidad del texto generado.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos.
- La longitud de contexto no se ha documentado; se recomienda verificar la ficha del modelo base.
- El uso en produccion requiere validar la calidad del quant elegido con datos reales, ya que los resultados pueden variar segun la tarea.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.8-27B puede tener restricciones adicionales; se debe revisar su licencia original.

## Enlaces

- [Repositorio HuggingFace: turboderp/Qwen3.8-27B-exl3](https://huggingface.co/turboderp/Qwen3.8-27B-exl3)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
