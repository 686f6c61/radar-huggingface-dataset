# Spectrallic/MOSS-Image-SFT-8step-DMD-int8-convrot

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un checkpoint derivado y cuantizado de MOSS-Image, el modelo de difusión text-to-image de OpenMOSS-Team. En concreto, parte del transformer SFT oficial en BF16, le fusiona la LoRA de destilación DMD de 8 pasos publicada por `lodestones` y cuantiza a INT8 las 168 capas lineales internas de los bloques, dejando el resto de tensores en BF16. El resultado se distribuye como un único fichero safetensors de 5,4 GB, listo para cargarse en ComfyUI y en motores compatibles.

Su relevancia práctica es doble. Por un lado, al llevar la destilación "horneada" permite generar imágenes en 8-10 pasos con CFG 1,0 sin necesidad de un nodo cargador de LoRA ni de gestionar dos artefactos. Por otro, replica exactamente el layout de `moss_image_sft_int8_convrot.safetensors` de Comfy-Org (proyecciones q/k/v fusionadas en `proj.qkv`, tensor `.comfy_quant` por cada lineal cuantizada), por lo que funciona como reemplazo directo en grafos y motores ya existentes.

El autor es Spectrallic, un publicador independiente, y el modelo se publica bajo licencia Apache-2.0, la misma del modelo base y de la LoRA. Es, en la práctica, una pieza de infraestructura para acelerar y abaratar inferencia de MOSS-Image, no una mejora de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image con backbone transformer por bloques (tensores `layers.N.proj.qkv`, `proj.o`, `ffn_up_gate`, `ffn_down`); el autor no detalla la arquitectura interna |
| Parámetros totales | no disponible (el repositorio ocupa 5,4 GB, mezcla de INT8 y BF16) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el prompt de texto lo procesa el codificador externo `qwen3.5_9b_int8_convrot`) |
| Tipos de cuantización | INT8 ConvRot (escala row-wise absmax tras rotación de Hadamard regular con grupo 256) en 168 lineales de bloque; BF16 en el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, fichero único (`diffusion-single-file`), layout ComfyUI con tensores `.comfy_quant` |

## Arquitectura y entrenamiento

El modelo base es `OpenMOSS-Team/MOSS-Image-SFT`, revisión `f972bd4b`, en BF16. Sobre él se aplica la LoRA `lora.safetensors` de `lodestones/MOSS-Image-SFT-8-steps-dmd`, revisión `f95df83b`, correspondiente al update 2600 en EMA (no a `lora_latest`). Esa LoRA tiene rango 128 y alpha 128, y se fusiona con fuerza 1,0 en las proyecciones `proj.{q,k,v,o,ffn_up_gate,ffn_down}` de todos los bloques. La fusión se calcula y se mantiene en FP32 (`W' = W + (alpha/rank) · up @ down`) antes de concatenar `proj.{q,k,v}` en `proj.qkv`, siguiendo el layout de Comfy-Org.

La cuantización se realiza con `convert_to_quant` v1.3.4 en modo `--int8 --scaling-mode row --convrot --convrot-group-size 256 --comfy_quant --save-quant-metadata`. Solo se cuantizan las 168 lineales de bloque; el resto de componentes permanece en BF16, igual que en el checkpoint de referencia de Comfy-Org, del que también se copian los marcadores `comfy_attention.config`. No hay información sobre el dataset de entrenamiento, el número de tokens vistos, ni sobre si el pipeline original incluyó RLHF o DPO; el autor no los documenta en esta ficha.

La innovación técnica relevante aquí no es arquitectónica sino de empaquetado: destilación DMD integrrada más cuantización INT8 con rotación Hadamard por grupos, manteniendo compatibilidad binaria de layout con los cargadores existentes (por ejemplo, Nox).

## Capacidades

- Generación de imágenes a partir de prompts de texto, con resolución de salida al menos hasta 1536×1536 (documentado) y 1056×1408 en formato vertical.
- Generación rápida en 8 pasos (hasta 10 en el ejemplo del autor) con CFG 1,0 y prompt negativo vacío.
- Prompts largos y descriptivos: los ejemplos de la ficha usan descripciones de varios párrafos con iluminación, materiales y composición.
- Sustitución directa de `moss_image_sft_int8_convrot.safetensors` en ComfyUI sin cargador de LoRA.
- Compatibilidad con motores que esperan el layout de Comfy-Org (`proj.qkv` fusionado), como Nox.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": es un modelo exclusivamente text-to-image.
- No hay información sobre calidad multilingüe de los prompts más allá de los ejemplos en inglés.

## Casos de uso

- **Sustitución directa en un grafo de ComfyUI ya montado**: al conservar nombres, dtypes, shapes y formato de cuantización del fichero de Comfy-Org, se puede reemplazar el checkpoint sin tocar el grafo ni añadir nodos de LoRA; se elimina un artefacto del pipeline.
- **Prototipado rápido de prompts**: con 8 pasos a CFG 1,0 el coste por imagen es bajo, lo que permite barrer decenas de variantes de prompt y seed en una sola sesión para elegir direcciones visuales antes de invertir en generaciones de mayor calidad.
- **Ilustración conceptual en equipos pequeños**: un estudio con una única GPU consumer puede producir ilustraciones de 1536×1536 con calidad "digital painting" para moodboards, portadas o arte conceptual, usando el ejemplo de ciudad flotante como referencia de estilo.
- **Generación de assets para web o videojuegos**: arquitecturas, paisajes y fondos en resoluciones altas y formatos tanto cuadrados como verticales, con seeds fijas para reproducibilidad.
- **Despliegue en servidores sin gestor de LoRA**: entornos que solo admiten un checkpoint único (motores ligeros, contenedores mínimos, nodos personalizados) pueden servirlo tal cual, sin la complejidad de fusionar la LoRA en tiempo de carga.
- **Aumento de datos sintéticos**: generación masiva de variaciones por seed para construir datasets de imagen sintética o para pruebas de pipelines de visión por computador aguas abajo.
- **Evaluación de cuantización**: sirve como punto de comparación controlado frente al BF16 con la misma LoRA fusionada, para medir la pérdida de calidad y la ganancia de VRAM/velocidad del esquema INT8 ConvRot con grupo 256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta parámetros de inferencia cualitativos (pasos, CFG, resolución, seed y sampler) para dos imágenes de ejemplo, sin métricas objetivas como FID, CLIP score o comparaciones numéricas frente al BF16.

| Ejemplo | Pasos | CFG | Resolución | Sampler / schedule | Seed |
|---|---|---|---|---|---|
| Ciudad flotante, pintura digital pastel | 10 | 1,0 | 1056×1408 | Euler flow, sigma schedule del release (shift 5) | 4873513220996790616 |
| Metrópolis flotante futurista al atardecer | 8 | 1,0 | 1536×1536 | Euler flow, sigma schedule del release (shift 5) | 11841263543751983967 |

## Requisitos de hardware

- **Pesos del transformer**: 5,4 GB en disco; en VRAM ocupa un orden de magnitud similar al cargarse (INT8 en 168 lineales, BF16 en el resto).
- **Codificador de texto**: se carga por separado y es `qwen3.5_9b_int8_convrot`, de Comfy-Org/MOSS-Image. No está incluido en este repositorio y su tamaño exacto no está disponible en la información proporcionada; por el nombre, es previsiblemente el componente que más VRAM consume.
- **VRAM estimada**: no verificada por el autor. Como orientación, el transformer más el VAE deberían manejarse en el rango de 8-12 GB, y el conjunto con el codificador de texto INT8 probablemente requiera 16-24 GB. Conviene tratarlo como estimación, no como dato medido.
- **GPU consumer**: previsiblemente cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) y, con margen más ajustado, en 16 GB; no hay confirmación del autor para 8-12 GB.
- **GPU de datacenter**: A100, H100 y L40S son adecuadas y permiten mayor paralelismo por lote.
- **Despliegue**: ComfyUI (escenario principal), Nox (citado explícitamente por el autor) y cualquier cargador que acepte el layout de Comfy-Org. Al ser un fichero único de difusión, no encaja en vLLM, TGI ni llama.cpp, que son motores para modelos de lenguaje.
- **Latencia y throughput**: no disponible. La ventaja teórica del esquema es 8 pasos con CFG 1,0, es decir, 8 evaluaciones de la red por imagen frente a las decenas típicas de un modelo no destilado, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Relación | Pasos | Cuantización | Layout | LoRA necesaria | Licencia |
|---|---|---|---|---|---|---|
| Spectrallic/MOSS-Image-SFT-8step-DMD-int8-convrot | Este modelo | 8-10 | INT8 ConvRot + BF16 | Comfy-Org (`proj.qkv` fusionado) | No (integrada) | Apache-2.0 |
| Comfy-Org/MOSS-Image (`moss_image_sft_int8_convrot`) | Referencia de layout | No disponible | INT8 ConvRot + BF16 | Comfy-Org | No, pero sin destilación | Apache-2.0 |
| lodestones/MOSS-Image-SFT-8-steps-dmd | LoRA de destilación | 8 | BF16 (la LoRA en sí) | LoRA estándar | Sí, requiere cargador | Apache-2.0 |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base sin destilar | No disponible | BF16 | `proj.q`/`k`/`v` separados | No | Apache-2.0 |

No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre estas variantes; la comparación es de empaquetado, coste de inferencia y compatibilidad.

## Limitaciones y advertencias

- **No es un modelo nuevo**: hereda íntegramente los sesgos, el estilo y las limitaciones del MOSS-Image-SFT original; no hay evaluación de sesgos en la información proporcionada.
- **Destilación en desarrollo**: el propio autor advierte que la LoRA DMD de `lodestones` es un trabajo en curso y que pueden aparecer actualizaciones; este checkpoint quedará desactualizado respecto a ellas.
- **Régimen de inferencia estrecho**: está pensado para 8-10 pasos con CFG 1,0 y prompt negativo vacío. No hay garantías de comportamiento con CFG alto, samplers distintos de Euler flow o schedules de sigma diferentes.
- **Riesgo de artefactos**: la destilación few-step suele degradar detalles finos y texto; no se documenta ninguna evaluación al respecto.
- **Dependencia del layout**: los cargadores que esperan `proj.q`, `proj.k` y `proj.v` como tensores separados no podrán leer este fichero sin conversión.
- **Dependencia externa**: requiere el codificador de texto `qwen3.5_9b_int8_convrot` de Comfy-Org/MOSS-Image, que no se distribuye en este repositorio.
- **Sin benchmarks**: no hay métricas publicadas de calidad, latencia ni consumo de VRAM; las estimaciones de hardware de esta ficha son orientativas.
- **Idiomas**: se desconoce el soporte multilingüe de prompts; los ejemplos documentados están en inglés.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de la LoRA aguas arriba antes de un despliegue en producción.
- **Madurez**: 0 descargas y 1 like en el momento de la consulta; es una publicación muy reciente y sin validación comunitaria.

## Enlaces

- [Spectrallic/MOSS-Image-SFT-8step-DMD-int8-convrot en HuggingFace](https://huggingface.co/Spectrallic/MOSS-Image-SFT-8step-DMD-int8-convrot)
- [OpenMOSS-Team/MOSS-Image-SFT (modelo base)](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [lodestones/MOSS-Image-SFT-8-steps-dmd (LoRA de destilación)](https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd)
- [Comfy-Org/MOSS-Image (checkpoint de referencia y codificador de texto)](https://huggingface.co/Comfy-Org/MOSS-Image)
- [silveroxides/convert_to_quant (cuantizador)](https://github.com/silveroxides/convert_to_quant)
- [Nox (motor de inferencia citado por el autor)](https://noxengine.dev/)
