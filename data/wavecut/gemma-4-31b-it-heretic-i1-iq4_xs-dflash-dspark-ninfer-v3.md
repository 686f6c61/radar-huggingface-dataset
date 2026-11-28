# WaveCut/gemma-4-31B-it-heretic-i1-IQ4_XS-DFlash-DSpark-NInfer-v3

## Resumen

Este artefacto es una conversión al formato propietario NInfer v3 del modelo Gemma 4 31B it en su variante "heretic", un ajuste descensurado (decensored) de coder3101 sobre el modelo oficial de Google. La conversión la firma WaveCut y parte del GGUF con cuantización i1-IQ4_XS generado por mradermacher. El resultado es un único fichero de 18,89 GiB que empaqueta los pesos cuantizados del modelo junto con dos drafters de decodificación especulativa (DFlash y DSpark), pensados para acelerar la inferencia en hardware de consumo.

El modelo subyacente es un transformer denso de 31B parámetros con 60 bloques, de los cuales 50 usan atención de ventana deslizante y 10 atención completa, con una anchura de 5376 y un MLP GeGLU de 21.504. La innovación principal del artefacto no está en el modelo base sino en el empaquetado: mantiene los bloques del GGUF byte a byte (sin recuantizar), añade los drafters con proyecciones en 8 bits y emplea la plantilla de chat canónica de Google en lugar de la copia antigua que arrastraba el release heretic.

Es relevante para quienes experimentan con decodificación especulativa en GPUs de consumo (el autor menciona explícitamente la RTX 3090) y para quienes necesitan un modelo de 31B sin las restricciones de rechazo del modelo original. Conviene señalar que los drafters requieren una versión de NInfer-all aún no fusionada en `master`, por lo que el artefacto no funciona con decodificación especulativa en la rama pública actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: 50 bloques de ventana deslizante y 10 de atención completa, anchura 5376, MLP GeGLU denso de 21.504 |
| Parámetros totales | 31B (según denominación del modelo base); el fichero contiene 950 parámetros en 784 objetos |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; los bloques de ventana deslizante del drafter DFlash operan sobre 2.048 posiciones |
| Tipos de cuantización | IQ4_XS (240 tensores), Q8_G32 (72), BF16 (46), Q6_K (1), FP32 (421) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | `.ninfer` (NInfer v3); conversión desde GGUF IQ4_XS y safetensors de los drafters |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B con una mezcla de atención local (ventana deslizante) y global: 50 de los 60 bloques emplean ventana deslizante y 10 atención completa, con anchura de 5376 y MLP GeGLU de 21.504. La tabla de tokens y la cabeza atada están en Q6_K, mientras que las normas y escalares de capa se guardan en FP32. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo original de Google en la información proporcionada.

El ajuste "heretic" de coder3101 aplica abliteración para eliminar la mayoría de los rechazos del modelo, con una divergencia KL de 0,0434 respecto al original y una reducción de rechazos de 99/100 a 15/100 en su conjunto de prueba (medido sobre el tune en BF16, no sobre este fichero). Sobre el empaquetado, se añaden dos drafters de decodificación especulativa: DFlash, entrenado específicamente para este tune heretic, con cinco capas de anchura 5376 (cuatro de ventana deslizante sobre 2.048 posiciones y una de atención completa), MLP de 10.752 y 64 cabezas de consulta sobre 8 cabezas KV de 128; lee los estados ocultos tras los bloques 1, 12, 23, 35, 46 y 57 y propone un bloque de 16 posiciones en una pasada. DSpark reutiliza el mismo backbone, reentrenado por Hikari07jp a partir del drafter DFlash de z-lab, y añade una cabeza Markov de rango 256 con dos tablas BF16 de 262.144 × 256 que condicionan cada borrador respecto al anterior.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo Gemma 4 31B it.
- Generación de código y matemáticas (capacidades del modelo base; no se detallan métricas en la información disponible).
- Decodificación especulativa mediante dos drafters empaquetados (DFlash y DSpark), seleccionables con `--spec dflash` o `--spec dspark` en NInfer-all.
- Modo descensurado: responde a solicitudes que el modelo de Google rechaza, gracias a la abliteración aplicada por coder3101.
- Plantilla de chat canónica de Google, con las correcciones para turnos de tool calling que el release heretic no incluía.
- Soporte de tool calling y function calling a través de la plantilla de chat de Google (no se detallan capacidades adicionales en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre decodificación especulativa: el artefacto permite comparar el rendimiento de dos drafters (DFlash y DSpark) sobre el mismo modelo base, con la salvedad de que requiere una versión de NInfer-all no fusionada en `master`.
- Despliegue de un modelo de 31B en una RTX 3090: la cuantización IQ4_XS y el tamaño de 18,89 GiB están pensados para caber en GPUs de consumo de gama alta, reduciendo los requisitos de VRAM frente a BF16.
- Generación de texto sin restricciones de rechazo: útil en entornos de investigación donde las respuestas evasivas del modelo original interfieren con la evaluación, siempre con salvaguardas propias por delante.
- Evaluación de técnicas de abliteración: permite medir el impacto de la eliminación de rechazos (15/100 frente a 99/100) sobre un modelo de 31B en tareas reales.
- Integración en pipelines de generación de texto con NInfer: el formato `.ninfer` y la librería `ninfer` permiten cargar el modelo con un único fichero y seleccionar el drafter en tiempo de ejecución.
- Pruebas de tool calling y agentes: la plantilla de chat corregida de Google facilita experimentar con turnos de llamada a herramientas en un modelo descensurado.
- Benchmarking de latencia en hardware de consumo: comparar la velocidad con y sin drafters (el autor indica que la build de `master` sin drafters produce respuestas idénticas byte a byte en sus cinco pruebas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de abliteración (15 rechazos de 100 frente a 99 de 100 del modelo de Google, KL de 0,0434), medidas sobre el tune en BF16 y no sobre este fichero.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 18,89 GiB; se necesita al menos esa cantidad más overhead de runtime para cargar el modelo completo.
- GPU recomendada por el autor: RTX 3090 (24 GB), mencionada explícitamente en los tags.
- Cabe en GPUs de consumo de gama alta con 24 GB o más; no se detallan requisitos para GPUs con menos VRAM.
- Opciones de despliegue: NInfer-all (rama `master` de iamwavecut/ninfer-all); los drafters requieren el runtime Gemma 4 DFlash/DSpark aún no fusionado.
- Latencia y throughput: no disponibles; la build de `master` sin drafters funciona con decodificación plana y produce las mismas respuestas que la build con drafters en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Gemma 4 31B it heretic + drafters) | 31B | No disponible | `.ninfer` | Apache 2.0 | Descensurado, con dos drafters de decodificación especulativa |
| google/gemma-4-31B-it | 31B | No disponible | Safetensors (original) | Licencia Gemma 4 | Modelo oficial con rechazos; 99/100 en el test de coder3101 |
| coder3101/gemma-4-31B-it-heretic | 31B | No disponible | Safetensors | No disponible | Tune descensurado en BF16; 15/100 rechazos, KL 0,0434 |
| mradermacher/gemma-4-31B-it-heretic-i1-GGUF | 31B | No disponible | GGUF (i1-IQ4_XS) | No disponible | Cuantización GGUF del tune heretic, base de este artefacto |

## Limitaciones y advertencias

- El modelo está descensurado por abliteración: responde a solicitudes que el modelo de Google rechaza. Es imprescindible colocar salvaguardas propias por delante en cualquier despliegue.
- Los drafters requieren una versión de NInfer-all no fusionada en `master`; la build pública actual arranca con error si se solicita `--spec dflash` o `--spec dspark` y solo funciona con decodificación plana.
- Riesgo de alucinación inherente a los modelos de lenguaje de 31B; no se han publicado evaluaciones específicas sobre este fichero.
- Las métricas de abliteración (15/100 rechazos, KL 0,0434) se midieron sobre el tune en BF16, no sobre este artefacto cuantizado.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables al modelo base antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento multilingüe.
- El release heretic original incluía una plantilla de chat antigua sin las correcciones de Google para tool calling; este artefacto la sustituye por la canónica, pero el tokenizer conserva la remediación de tokens glitch aplicada por Google.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/WaveCut/gemma-4-31B-it-heretic-i1-IQ4_XS-DFlash-DSpark-NInfer-v3)
- [NInfer (repo original)](https://github.com/Neroued/ninfer)
- [NInfer-all (rama master)](https://github.com/iamwavecut/ninfer-all)
- [Documentación de conversión Gemma 4 en NInfer-all](https://github.com/iamwavecut/ninfer-all/blob/master/docs/gemma4.md#converting)
- [coder3101/gemma-4-31B-it-heretic](https://huggingface.co/coder3101/gemma-4-31B-it-heretic)
- [google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [mradermacher/gemma-4-31B-it-heretic-i1-GGUF](https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-i1-GGUF)
- [manateelazycat/Gemma-4-31B-IT-Heretic-Draft-DFlash](https://huggingface.co/manateelazycat/Gemma-4-31B-IT-Heretic-Draft-DFlash)
- [Hikari07jp/DSpark-Gemma-4-31B-draft](https://huggingface.co/Hikari07jp/DSpark-Gemma-4-31B-draft)
- [z-lab/gemma-4-31B-it-DFlash](https://huggingface.co/z-lab/gemma-4-31B-it-DFlash)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
