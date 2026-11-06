# unfold-labs/unfold-whistle-fr

## Resumen

unfold-whistle-fr es un ajuste fino en francés de Whistle, el modelo de reconocimiento automático del habla (ASR) on-device de Cactus Compute. Lo publica unfold-labs, el equipo detrás de la aplicación Unfold Note, y es el modelo que dicha aplicación ejecuta en el ordenador cuando el idioma hablado seleccionado es el francés. No guarda relación con la familia Whisper de OpenAI a pesar de la similitud del nombre.

El modelo está especializado en transcripción de reuniones de negocios en francés. Se distribuye como un único fichero de 29,3 MB (`whistle-fr.cact`) con pesos de 4 bits y activaciones de 8 bits (W4A8) y 8 capas de decodificador, pensado para ejecutarse en el motor Cactus (WASM) sin necesidad de GPU. La ventana de contexto, el número de parámetros y la arquitectura interna del modelo base no se detallan en la información disponible.

Su relevancia práctica radica en que mejora un 11,9 % el error de palabra sobre reuniones reales respecto al modelo base (de 39,1 % a 34,5 % de WER) manteniendo un coste computacional mínimo, con un factor de tiempo real de 0,17 en una CPU Intel i7-14700F. Es, por tanto, una pieza de interés para quien necesite ASR francés privado y local en entornos de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Cactus-Compute/whistle; 8 capas de decodificador) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el pipeline corta el audio en fragmentos de 25 s como máximo) |
| Tipos de cuantizacion | W4A8 (pesos de 4 bits, activaciones de 8 bits); el modelo base admite también 2 bits |
| Idiomas soportados | Francés (fr) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (motor Cactus); base en safetensors (`checkpoints/whistle.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `whistle.safetensors` de Cactus-Compute/whistle en la revisión `741118687e1f`. Sobre él se entrenó un adaptador LoRA de rango 16 y alpha 32 mediante `cactus whistle finetune` (versión 4.0.1 de `cactus-compute`), con entrenamiento consciente de cuantización (pesos de 4 bits durante el entrenamiento), tasa de aprendizaje 1e-3, 3 épocas y tamaño de lote 16. Antes de la exportación a 4 bits se fusionó el 90 % del adaptador en el modelo base (actualización escalada por 0,9).

Los datos de entrenamiento combinan 22,75 horas de grabaciones privadas de reuniones de negocios en francés de los dos fundadores de Unfold Note, troceadas en 12.334 clips de 28 segundos como máximo y con transcripciones de un reconocedor de voz servidor como objetivos, junto con los 3.193 clips (10,3 horas) del split de entrenamiento francés de FLEURS (CC BY 4.0). La mezcla de FLEURS busca preservar el francés general, ya que el entrenamiento solo con reuniones provocaba que el modelo escribiera habla de reunión en discurso leído. No se detalla la arquitectura interna del transformer subyacente ni el volumen total de tokens de audio.

## Capacidades

- Reconocimiento automático del habla en francés, orientado a reuniones de negocios y audio conversacional.
- Transcripción de audio con troceado por pausas en fragmentos de hasta 25 segundos.
- Ejecución on-device en CPU mediante el motor Cactus (WASM), sin GPU.
- Integración con `cactus-needle` 0.3.0 y carga equivalente al modelo base `whistle.cact`.
- Mejora específica en nombres propios de personas y organizaciones (WER del 58 % al 40 % en reuniones).
- No dispone de detección fiable de idioma: con autodetección interpreta el inglés como francés.

## Casos de uso

- Transcripción de reuniones de empresa en francés: el ajuste está entrenado con reuniones reales de una pequeña empresa, por lo que reconoce vocabulario de negocios y nombres propios con menor tasa de error que el modelo base.
- Notas inteligentes en aplicaciones de escritorio: es el modelo que Unfold Note ejecuta localmente cuando el usuario elige francés, lo que permite transcribir sin enviar audio a un servidor.
- Procesamiento privado de audio sensible: al ejecutarse on-device con 29,3 MB, encaja en flujos donde el audio no puede salir del equipo del usuario.
- Subtitulado y actas de reuniones en tiempo casi real: con un factor de tiempo real de 0,17 en un Intel i7-14700F, procesa audio sustancialmente más rápido que en tiempo real.
- Despliegue en equipos sin GPU: el motor Cactus en WASM permite integrarlo en aplicaciones de escritorio o web sin infraestructura de aceleración.
- Dictado y captura de voz en francés en herramientas ofimáticas, siempre que se fije el idioma a `fr` de forma explícita.
- Investigación sobre ASR de bajo consumo: sirve como referencia de ajuste LoRA consciente de cuantización sobre un modelo on-device.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, menor es mejor), decodificada con el pipeline de Unfold Note (corte por pausas en piezas de 25 segundos como máximo, idioma forzado a francés):

| Conjunto de prueba | Base `whistle.cact` (`b358ddad`) | `unfold-whistle-fr` |
|---|---|---|
| Reuniones reservadas: 22 reuniones de un fundador, 7,3 h | 39,1 % | 34,5 % |
| FLEURS francés test, 676 clips | 33,5 % | 34,0 % |
| Habla sintética francesa, 205 s | 7,3 % | 5,9 % |

En reuniones, los errores caen un 11,9 %; en nombres de personas y organizaciones, del 58 % al 40 %. El francés general (FLEURS) empeora 0,4 puntos. En habla sintética inglesa con autodetección de idioma el WER es del 21 %, frente al 5,4 % forzando inglés. Velocidad y memoria son las del modelo base en un Intel i7-14700F: factor de tiempo real 0,17 y unos 160 MB por motor cargado (+15 a +40 MB respecto a la base de 2 bits).

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU; el motor Cactus (WASM) ejecuta el modelo en procesadores de escritorio convencionales.
- Memoria: aproximadamente 160 MB por motor cargado, entre 15 y 40 MB más que la variante base de 2 bits.
- GPU recomendadas: no aplica; no se documenta soporte de aceleración por GPU.
- Cabe en cualquier equipo de consumo: el fichero pesa 29,3 MB y el consumo de memoria es de centenas de MB.
- Despliegue: motor Cactus con `cactus-needle` 0.3.0 (WASM); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real 0,17 medido en un Intel i7-14700F.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER reuniones (fr) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unfold-whistle-fr | No disponible | No disponible | 34,5 % | Apache 2.0 | Hugging Face |
| Cactus-Compute/whistle (base) | No disponible | No disponible | 39,1 % | No disponible en la información | Hugging Face |
| Whisper (familia de OpenAI) | No disponible en la información | No disponible | No disponible | No disponible en la información | No disponible |

No se dispone de datos de benchmarks de otras alternativas ASR en francés en la información proporcionada, por lo que la comparación con modelos de terceros queda como no disponible.

## Limitaciones y advertencias

- Entrenado con reuniones de dos personas de una única empresa pequeña: los nombres y términos frecuentes en ese contexto tienen más probabilidad de aparecer como salida.
- El audio silencioso, por debajo de aproximadamente −42 dBFS, puede descartarse en el corte por pausas antes de llegar al modelo; es una propiedad del pipeline, no del modelo.
- No usar con autodetección de idioma: interpreta el inglés como francés (21 % de WER en habla sintética inglesa frente al 5,4 % forzando inglés). Hay que fijar el idioma a `fr`.
- Las referencias de las reuniones son a su vez salida de un reconocedor automático, por lo que las cifras de reuniones miden la concordancia con ese sistema, no con transcripción humana.
- El rendimiento en francés general es ligeramente inferior al del modelo base (0,4 puntos de WER en FLEURS).
- Riesgo de alucinación y de sesgo hacia el vocabulario del dominio de entrenamiento no cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos FLEURS (CC BY 4.0) en despliegues de producción.
- Solo soporta francés; no hay soporte multilingüe documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unfold-labs/unfold-whistle-fr
- Modelo base: https://huggingface.co/Cactus-Compute/whistle
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Organización Unfold Labs en Hugging Face: https://huggingface.co/unfold-labs
- Aplicación Unfold Note: https://unfoldnote.app
