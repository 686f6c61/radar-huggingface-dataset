# tensorkelechi/krea2-style-adapter-fix

## Resumen

`tensorkelechi/krea2-style-adapter-fix` no es un modelo generativo completo, sino un conjunto de pesos corregidos (un "fix") para el adaptador de estilo de Krea 2 desarrollado originalmente por Lyra (`lyraaaa/krea2-sref-adapter`). El problema que aborda es la fuga de objetos: los códigos de estilo de 64 dimensiones del adaptador original varían más con el sujeto de la imagen que con el estilo propiamente dicho, de modo que ciertos objetos recurrentes ("ghost objects") se cuelan en las generaciones independientemente del prompt. El autor aplica una proyección ortogonal de Fisher con `k=4` sobre las direcciones de mayor varianza intra-estilo para eliminar esos modos contaminantes.

La intervención es puramente post-hoc: no requiere reentrenamiento, conserva el tamaño `STYLE_SIZE = 540.0` y mantiene la compatibilidad exacta de forma `[64, 108, 6144]`, por lo que los ficheros `.npz` resultantes funcionan como reemplazo directo en los nodos de ComfyUI de Lyra sin modificar código. El repositorio incluye además el script `deleak_basis.py` para reproducir la transformación.

Es relevante para quienes ya usan el adaptador `sref` de Krea 2 en flujos de ComfyUI y quieren reducir la copia de objetos no deseados manteniendo la fidelidad de estilo, con la advertencia de que la mejora en algunas métricas tiene intervalos de confianza que rozan el cero por el tamaño muestral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de estilo sobre Krea 2 (proyeccion lineal de codigos de estilo de 64 dimensiones; no es un transformer ni un modelo generativo autonomo) |
| Parametros totales | no disponible (el repo pesa 0.3 GB en ficheros `.npz`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como arrays NumPy `.npz` en float32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy): `sref_space_clean.npz`, `sref_space_lg_clean.npz`, `sref_space_variant_clean.npz`, `sref_image_clean.npz` |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto. El fix se construye calculando la matriz de dispersión (scatter) blanqueada agrupada por estilo sobre 868 imágenes y 126 estilos, y proyectando fuera las 4 direcciones de Fisher intra-estilo con mayores ratios (`[11.52, 10.85, 10.21, 8.82]`, en torno al 15 % de la energía del código aleatorio por defecto). El resultado es una base ortogonal de estilo de 64 dimensiones con los modos de "objeto fantasma" globales suprimidos.

El adaptador opera en el espacio latente de Krea 2: el bloque de estilo resultante es una matriz `108 x 6144` que se concatena tras la fusión de texto (`txtfusion`) y su MLP, con posición cero igual que los tokens de prompt. Se mantienen los tres espacios (`"default"`, `"lg"`, `"variant"`) y las funciones de mezcla `coords` / `block_from_coords` del adaptador original.

## Capacidades

- Transferencia de estilo por referencia de imagen (`sref`) en el pipeline de Krea 2, con control de intensidad mediante `strength`.
- Reducción de la copia de objetos recurrentes ("ghost objects") respecto al adaptador original, manteniendo el estilo impresionista y la pincelada.
- Compatibilidad directa (drop-in) con los nodos `ComfyUI-Krea2-Sref` sin cambios de código.
- Uso programático desde Python mediante `style_block(code, strength)` que devuelve un array `[108, 6144]`.
- Mejora de la recuperación de estilo en held-out (Top-1 de `.389` a `.456`).
- Reproducibilidad del transform mediante `deleak_basis.py`.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un componente de acondicionamiento de estilo.

## Casos de uso

- Generación de imágenes con estilo consistente en ComfyUI: sustituir los cuatro `.npz` originales por los `*_clean.npz` renombrados en `ComfyUI/models/krea2_sref/` para reducir objetos no deseados sin tocar los nodos.
- Series de ilustración con estilo fijo: usar códigos de estilo limpiados para que un mismo estilo se aplique a sujetos distintos (retratos, bodegones, paisajes) sin arrastrar objetos de la referencia.
- Exploración de estilos con `--sref` aleatorio: con códigos aleatorios, el fix reduce la fuga de objetos entre prompts (DINO cross-prompt de `.141` a `.087`).
- Integración en pipelines Python propios: concatenar el bloque `[108, 6144]` tras `txtfusion` y su MLP para inyectar estilo en generaciones de Krea 2 Turbo a 640 px.
- Investigación sobre subspacios de estilo: usar `deleak_basis.py` y las matrices de dispersión para estudiar qué direcciones codifican estilo frente a sujeto.
- Control de diversidad estilística: ajustar `strength` y el espacio (`default`/`lg`/`variant`) para equilibrar consistencia intra-código (CSD `.383 -> .425`) y diversidad entre códigos (CSD `.140 -> .124`).

## Benchmarks y rendimiento

Evaluado sobre Krea 2 Turbo a 640 px con los ajustes por defecto de Lyra:

| Benchmark | Metrica | Original | Limpio (`fisher k=4`) | Delta |
|---|---|---|---|---|
| Recuperacion de estilo held-out | Top-1 | .389 | .456 | +.067 |
| Test A (8 codigos x 3 prompts) | DINO cross-prompt (menor = menos objetos fantasma) | .141 | .087 | −.054 [−.133, +.001] |
| Test A | CSD intra-codigo (consistencia) | .383 | .425 | +.042 |
| Test A | CSD entre codigos (diversidad) | .140 | .124 | −.016 |
| Test A | CLIP-T (adherencia al prompt) | .235 | .233 | −.002 |
| Test B (image-to-sref, 10 codigos MJ) | CSD de grupo (ajuste de estilo) | .353 | .382 | +.030 [+.004, +.055] |
| Test B | `DINO_fed` (fuga de objeto de la imagen alimentada) | .171 | .166 | sin cambio |
| Test B | CLIP-T | .228 | .232 | +.004 |

## Requisitos de hardware

- No aplica VRAM propia: los `.npz` son ficheros de pesos de adaptador (repo de 0.3 GB) que se cargan en memoria junto al modelo Krea 2.
- El requisito real lo marca Krea 2 Turbo: se necesita una GPU capaz de ejecutar el modelo base (no especificado en la informacion disponible).
- Despliegue mediante los nodos `ComfyUI-Krea2-Sref` en ComfyUI o mediante la función `style_block` de `sref.py` en Python.
- Latencia y throughput: no disponibles; el coste añadido es una concatenación de un tensor `[108, 6144]` al contexto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tensorkelechi/krea2-style-adapter-fix` | Fix de adaptador de estilo (`.npz`) | no disponible | no aplica | MIT | HF, 0 descargas |
| `lyraaaa/krea2-sref-adapter` | Adaptador de estilo original | no disponible | no aplica | no disponible en la informacion | HF + nodos ComfyUI |
| Krea 2 Turbo | Modelo base de generacion de imagen | no disponible | no aplica | no disponible en la informacion | no disponible |

## Limitaciones y advertencias

- El intervalo de confianza bootstrap del 95 % para el delta de DINO cross-prompt en Test A (`[−.133, +.001]`) toca el cero: la mejora es sólida en los peores casos, pero estadísticamente frágil con 8 códigos x 3 prompts.
- La fuga de sujeto en image-to-sref (`DINO_fed`) apenas cambia (`.171 -> .166`) porque la fuga específica de la imagen está repartida por las 60 direcciones VLM restantes; el corte de rango 4 solo elimina modos globales compartidos entre códigos.
- No es un modelo autónomo: sin Krea 2 y los nodos o `sref.py` de Lyra no hace nada.
- Requiere renombrar los ficheros y hacer copia de seguridad de los originales; un error de nombres rompe el drop-in.
- Licencia MIT para estos pesos, pero la del modelo base y del adaptador original debe verificarse por separado para uso comercial.
- Repositorio sin descargas ni likes y creado en 2026-11-25: sin validación comunitaria.
- No hay información sobre sesgos, idiomas ni alucinación aplicable a este componente.

## Enlaces

- Hugging Face: https://huggingface.co/tensorkelechi/krea2-style-adapter-fix
- Adaptador original: https://huggingface.co/lyraaaa/krea2-sref-adapter
- Nodos ComfyUI: https://github.com/lyramakesmusic/krea2-sref-adapter
- Repo Chameleon: https://github.com/kelechi-c/chameleon
- Writeup: https://artifacts.kelechi.cc/articles/chameleon-v2-linear-style-subspaces
- Explicador interactivo: https://artifacts.kelechi.cc/chameleon_v2_explainer/
