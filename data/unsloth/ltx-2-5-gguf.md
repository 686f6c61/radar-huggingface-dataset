# unsloth/LTX-2.5-GGUF

## Resumen

`unsloth/LTX-2.5-GGUF` es la versión cuantizada en formato GGUF de LTX-2.5, el modelo de difusión de Lightricks construido sobre una arquitectura DiT (diffusion transformer) que genera vídeo con audio a partir de texto, de una imagen, o de ambas modalidades combinadas (text-to-video, image-to-video, text-to-audio-video, image-to-audio-video). El modelo original tiene 21.004.025.600 parámetros según los safetensors (la model card lo denomina 22B) y se distribuye en dos checkpoints: `dev` (completo, 30 pasos de muestreo, CFG 3) y `distilled` (destilado, 8 + 3 pasos en dos etapas, CFG 1).

El repositorio lo mantiene Unsloth y aplica su metodología Unsloth Dynamic 2.0: los ficheros con prefijo `UD-` usan precisión mixta, con el tipo de cada capa elegido a partir de un escaneo de sensibilidad medido, y según el autor superan a los ficheros uniformes del mismo tamaño. Se incluyen once variantes por checkpoint, desde Q2_K (8,46 GB) hasta BF16 (42,03 GB), lo que permite ejecutar un DiT de 21B en GPU de consumo.

Su relevancia práctica es esa: hasta ahora un modelo de vídeo de este tamaño exigía hardware de datacenter, y esta cuantización lo lleva a tarjetas de 12-24 GB mediante ComfyUI-GGUF o Unsloth Studio. La model card publica además métricas objetivas de degradación (LPIPS y PSNR contra el DiT en bf16) para cada fichero, algo poco habitual en cuantizaciones de modelos de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) audio-vídeo; no es un transformer autorregresivo ni un MoE |
| Parametros totales | 21.004.025.600 (~21,0 B; la model card usa la etiqueta 22B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; los ejemplos publicados renderizan 1280x704, 121 fotogramas a 24 fps |
| Tipos de cuantizacion | Q2_K, UD-Q2_K_XL, Q3_K_M, UD-Q3_K_XL, Q4_K_M, UD-Q4_K_XL, Q5_K_M, UD-Q5_K_XL, Q6_K, Q8_0 y BF16 (repack sin pérdida), por duplicado para `dev` y `distilled` |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (nueve idiomas) |
| Licencia | `ltx-2.x-community-license-agreement` (etiquetada como `other`, no OSI) |
| Formato de pesos | GGUF; el text encoder, los VAE y el upscaler latente no se incluyen y deben tomarse de `Lightricks/LTX-2.5` |
| Tamano del repositorio | 479,3 GB (conjunto de todos los ficheros) |
| Pasos de muestreo | `dev`: 30 pasos, CFG 3; `distilled`: 8 + 3 pasos en dos etapas, CFG 1 |
| Entradas / salidas | texto, imagen → vídeo; texto, imagen → vídeo con audio |

## Arquitectura y entrenamiento

El modelo subyacente es un DiT que procesa latentes de vídeo y audio de forma conjunta, con un text encoder y varios VAE (vídeo y audio) más un upscaler latente que se distribuyen por separado y no se han recuantizado en este repositorio. La existencia de dos checkpoints con regímenes de muestreo tan distintos es relevante para producción: el `dev` necesita 30 pasos con CFG 3, mientras que el `distilled` resuelve la generación en 8 + 3 pasos con CFG 1, una reducción de coste computacional muy agresiva a cambio de una ligera pérdida de fidelidad respecto a la versión completa.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de `Lightricks/LTX-2.5`, no incluida aquí. La innovación técnica que sí documenta este repositorio es la cuantización: Unsloth Dynamic 2.0 realiza un escaneo de sensibilidad por capa y asigna a cada una un tipo distinto, de modo que los ficheros `UD-` mezclan precisiones dentro del mismo modelo. El autor verifica las afirmaciones con LPIPS y PSNR sobre 121 fotogramas y varias semillas, en ejecución determinista, de forma que una renderización bf16 repetida puntúa 0 y las cifras miden exclusivamente el error de cuantización. El BF16 incluido es un repack sin pérdida, bit-idéntico al original al pasar por la ruta GGUF.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 1280x704 y 121 fotogramas a 24 fps en los ejemplos publicados.
- Generación de vídeo a partir de una imagen (image-to-video), pipeline declarado del repositorio.
- Generación conjunta de vídeo y audio (text-to-audio-video e image-to-audio-video), con audio presente en las muestras publicadas.
- Prompts multilingües en nueve idiomas: inglés, alemán, español, francés, japonés, coreano, chino, italiano y portugués.
- Dos modos de inferencia: calidad máxima con el checkpoint `dev` (30 pasos) y baja latencia con el `distilled` (8 + 3 pasos).
- Control de semilla para reproducibilidad; la model card documenta ejecución determinista con semilla 42.
- Integración con ComfyUI mediante el nodo `Unet Loader (GGUF)` de ComfyUI-GGUF, y con Unsloth Studio.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje, sino un modelo generativo de medios.

## Casos de uso

- **Publicidad y contenido para redes sociales**: generar clips de 121 fotogramas a 24 fps (unos 5 segundos) con audio sincronizado directamente desde un brief de texto, usando el checkpoint `distilled` para iterar rápido sobre variantes creativas y el `dev` para el render final.
- **Previsualización de storyboards**: convertir un frame de concepto o un boceto en un plano animado mediante image-to-video, lo que permite a un equipo de producción validar encuadre, movimiento y ritmo antes de rodar.
- **Localización de vídeo con audio**: al aceptar prompts en nueve idiomas, se puede reutilizar el mismo pipeline para generar variantes de un anuncio orientadas a mercados hispanohablante, germanoparlante o japonés sin cambiar de modelo.
- **Contenido formativo y explicativo**: generar animaciones cortas con narración o ambiente sonoro para cursos técnicos, aprovechando la generación conjunta de audio y vídeo para evitar un paso posterior de montaje sonoro.
- **Prototipado en estudios de VFX y animación**: producir *previz* animados de planos complejos con el checkpoint `dev` a 30 pasos, e integrar el resultado como referencia en la cadena de postproducción.
- **Vídeo de producto para comercio electrónico**: animar fotografías de catálogo con image-to-video para obtener clips de ficha de producto sin sesión de rodaje, ajustando la cuantización (UD-Q4_K_XL, 14 GB) para que quepa en la GPU disponible.
- **Pipelines automatizados en ComfyUI**: desplegar el modelo como nodo dentro de un grafo que incluya el text encoder y los VAE de `Lightricks/LTX-2.5`, con los ficheros GGUF como único componente cuantizado y el resto intacto.
- **Investigación en cuantización de modelos de difusión**: usar la batería de ficheros con LPIPS y PSNR publicados como referencia reproducible para estudiar la relación entre bits por peso y degradación perceptual en modelos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un modelo de difusión). Lo que sí se publica es la degradación de cada cuantización frente al DiT en bf16, medida como LPIPS (menor es mejor) y PSNR sobre la media de los 121 fotogramas, con el mismo prompt, semilla, text encoder y ajustes.

Checkpoint destilado (`distilled/`), 1280x704, 121 fotogramas, 8 + 3 pasos, CFG 1, 4 semillas:

| Fichero | Tamano | Bits por peso | LPIPS vs bf16 | PSNR vs bf16 |
|---|---|---|---|---|
| `distilled/ltx-2.5-22b-distilled-Q2_K.gguf` | 8,46 GB | 3,22 | 0,567 | 14,8 dB |
| `distilled/ltx-2.5-22b-distilled-UD-Q2_K_XL.gguf` | 9,50 GB | 3,62 | 0,416 | 17,1 dB |
| `distilled/ltx-2.5-22b-distilled-Q3_K_M.gguf` | 11,30 GB | 4,30 | 0,390 | 17,3 dB |
| `distilled/ltx-2.5-22b-distilled-UD-Q3_K_XL.gguf` | 12,00 GB | 4,57 | 0,310 | 19,1 dB |
| `distilled/ltx-2.5-22b-distilled-Q4_K_M.gguf` | 13,58 GB | 5,17 | 0,352 | 18,1 dB |
| `distilled/ltx-2.5-22b-distilled-UD-Q4_K_XL.gguf` | 14,00 GB | 5,33 | 0,320 | 19,4 dB |
| `distilled/ltx-2.5-22b-distilled-Q5_K_M.gguf` | 15,63 GB | 5,95 | 0,316 | 18,9 dB |
| `distilled/ltx-2.5-22b-distilled-UD-Q5_K_XL.gguf` | 16,00 GB | 6,09 | 0,296 | 20,3 dB |
| `distilled/ltx-2.5-22b-distilled-Q6_K.gguf` | 17,81 GB | 6,78 | 0,274 | 20,4 dB |
| `distilled/ltx-2.5-22b-distilled-Q8_0.gguf` | 22,78 GB | 8,68 | 0,242 | 21,6 dB |
| `distilled/ltx-2.5-22b-distilled-BF16.gguf` | 42,03 GB | 16,01 | 0 (bit-idéntico) | sin pérdida |

Checkpoint completo (raíz del repositorio), 1280x704, 121 fotogramas, 30 pasos, CFG 3, 2 semillas:

| Fichero | Tamano | Bits por peso | LPIPS vs bf16 | PSNR vs bf16 |
|---|---|---|---|---|
| `ltx-2.5-22b-dev-Q2_K.gguf` | 8,46 GB | 3,22 | 0,592 | 14,3 dB |
| `ltx-2.5-22b-dev-UD-Q2_K_XL.gguf` | 9,50 GB | 3,62 | 0,354 | 16,6 dB |
| `ltx-2.5-22b-dev-Q3_K_M.gguf` | 11,30 GB | 4,30 | 0,427 | 15,4 dB |
| `ltx-2.5-22b-dev-UD-Q3_K_XL.gguf` | 12,00 GB | 4,57 | 0,246 | 20,0 dB |
| `ltx-2.5-22b-dev-Q4_K_M.gguf` | 13,58 GB | 5,17 | 0,330 | 16,8 dB |
| `ltx-2.5-22b-dev-UD-Q4_K_XL.gguf` | 14,00 GB | 5,33 | 0,183 | 21,4 dB |
| `ltx-2.5-22b-dev-Q5_K_M.gguf` | 15,63 GB | 5,95 | 0,208 | 20,1 dB |
| `ltx-2.5-22b-dev-UD-Q5_K_XL.gguf` | 16,00 GB | 6,09 | 0,162 | 22,1 dB |
| `ltx-2.5-22b-dev-Q6_K.gguf` | 17,81 GB | 6,78 | 0,180 | 21,2 dB |
| `ltx-2.5-22b-dev-Q8_0.gguf` | 22,78 GB | 8,68 | 0,169 | 23,4 dB |
| `ltx-2.5-22b-dev-BF16.gguf` | 42,03 GB | 16,01 | referencia | referencia |

Como escala de referencia, el autor señala que `unsloth/LTX-2.5-FP8` (DiT en INT8-ConvRot y en FP8) obtiene 0,265 y 0,366 de LPIPS en los mismos clips con los ajustes por defecto de Unsloth Studio en modo compilado, donde la diferencia entre bf16 compilado y sin compilar ya es de 0,265 por sí sola.

## Requisitos de hardware

- **VRAM estimada**: los ficheros GGUF ocupan entre 8,46 GB (Q2_K) y 42,03 GB (BF16), pero esa cifra es solo el peso del DiT. Hay que sumar el text encoder, los VAE de vídeo y audio y el upscaler latente, que se cargan aparte desde `Lightricks/LTX-2.5` y no están cuantizados. No se han publicado requisitos oficiales de VRAM total.
- **Recomendación del autor**: `UD-Q4_K_XL` (14,0 GB) para la mayoría de GPU, por ser claramente mejor que `Q4_K_M` y equiparable a `Q5_K_M`, que pesa 1,6 GB más. Para la salida más próxima a bf16, `Q8_0` (22,78 GB). En tarjetas pequeñas, `UD-Q2_K_XL` (9,5 GB), descrito como mucho más limpio que `Q2_K` y cercano a `Q3_K_M` con 1,8 GB menos.
- **Cabe en GPU de consumo**: sí, en el rango de 12 a 24 GB, siempre que se elija la cuantización adecuada y se tenga en cuenta el coste adicional del text encoder y los VAE. Las estimaciones de encaje por tarjeta no están publicadas y deben validarse en el equipo concreto.
- **GPU de datacenter**: A100 y H100 permiten trabajar en BF16 (42,03 GB) sin cuantizar el DiT, lo que equivale a la referencia de calidad.
- **Opciones de despliegue**: ComfyUI con el nodo `Unet Loader (GGUF)` de ComfyUI-GGUF (probado por el autor en todos los ficheros) y Unsloth Studio. vLLM, TGI, llama.cpp u Ollama no aplican: son servidores de modelos de lenguaje, no de difusión.
- **Latencia y throughput**: no disponible. Como referencia cualitativa, el checkpoint `distilled` resuelve la generación en 8 + 3 pasos frente a los 30 pasos del `dev` a la misma resolución y número de fotogramas, lo que reduce el coste de cómputo de forma sustancial.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos | Licencia | Notas |
|---|---|---|---|---|---|
| `unsloth/LTX-2.5-GGUF` (este) | 21,0 B | GGUF, 11 variantes por checkpoint | 30 (dev) / 8+3 (distilled) | LTX-2.x Community | Cuantización mixta UD; métricas LPIPS/PSNR publicadas; audio y vídeo |
| `Lightricks/LTX-2.5` | 21,0 B | safetensors bf16 | 30 (dev) / 8+3 (distilled) | LTX-2.x Community | Referencia de calidad; incluye text encoder, VAE y upscaler que este repo no trae |
| `unsloth/LTX-2.5-FP8` | 21,0 B | FP8 e INT8-ConvRot | no disponible | LTX-2.x Community | LPIPS 0,366 (FP8) y 0,265 (INT8-ConvRot) en modo compilado por defecto |
| `unsloth/LTX-2.3-GGUF` | no disponible | GGUF, misma estructura de directorios | no disponible | no disponible | Generación anterior; sirve de referencia de continuidad en el formato |

No se dispone de datos en la información proporcionada para comparar con alternativas de otros fabricantes (por ejemplo, familias de modelos de vídeo abiertas de tamaño similar); esa comparación queda como no disponible.

## Limitaciones y advertencias

- **Licencia no OSI**: `ltx-2.x-community-license-agreement` se etiqueta como `other`. Hay que leer el texto completo antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT y puede imponer restricciones de uso, atribución o umbrales de facturación.
- **Riesgo de artefactos**: es un modelo generativo de difusión. Puede producir movimiento incoherente, deformaciones anatómicas, texto ilegible en pantalla y desincronización entre audio y vídeo, especialmente en cuantizaciones agresivas.
- **Degradación medible por cuantización**: el autor documenta que los samplers reintroducen ruido en cada paso, de modo que pequeños errores en los pesos afectan más al movimiento que al aspecto de un fotograma aislado. En Q2_K el LPIPS llega a 0,567 y el PSNR baja a 14,8 dB, valores que en la práctica se traducen en alteraciones de motion.
- **Comparaciones sensibles al modo de ejecución**: las cifras de LPIPS no son directamente comparables entre modos compilado y no compilado. La propia model card advierte que la diferencia entre bf16 compilado y sin compilar es de 0,265, del mismo orden que el error de algunas cuantizaciones.
- **Dependencias externas**: el repositorio solo contiene el DiT cuantizado. Sin el text encoder, los VAE y el upscaler latente de `Lightricks/LTX-2.5` el modelo no funciona, lo que añade descargas y VRAM no reflejadas en el tamaño de los ficheros GGUF.
- **Idiomas**: se listan nueve, pero no se publica ninguna evaluación de calidad por idioma; el rendimiento en prompts en español, coreano o árabe no está cuantificado. El árabe aparece en las etiquetas de arXiv pero no en la lista de idiomas de la model card.
- **Sesgos**: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación en la información disponible.
- **Longitud y resolución**: los ejemplos publicados se limitan a 121 fotogramas a 24 fps y 1280x704. No se especifica el máximo soportado ni el comportamiento más allá de esas condiciones.
- **Madurez del repositorio**: creado el 13 de octubre de 2026 y actualizado tres días después, con 12 likes y 39.464 descargas. Conviene fijar una revisión concreta en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/LTX-2.5-GGUF
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Versión FP8 del mismo autor: https://huggingface.co/unsloth/LTX-2.5-FP8
- Cuantización de la generación anterior: https://huggingface.co/unsloth/LTX-2.3-GGUF
- Licencia LTX-2.x Community: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Documentación de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Unsloth Studio: https://github.com/unslothai/unsloth/
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Discord de Unsloth: https://discord.gg/unsloth
- Paper: https://arxiv.org/abs/2601.03233
- Muestras de texto a vídeo: https://huggingface.co/unsloth/LTX-2.5-GGUF/blob/main/samples/ltx25_distilled_UD-Q4_K_XL_t2v.mp4
- Muestras de imagen a vídeo: https://huggingface.co/unsloth/LTX-2.5-GGUF/blob/main/samples/ltx25_distilled_UD-Q4_K_XL_i2v.mp4
