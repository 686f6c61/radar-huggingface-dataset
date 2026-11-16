# summerAIO/Irodori-TTS-v4.1-Small-LUNA

## Resumen

Irodori-TTS-v4.1-Small-LUNA es un checkpoint de síntesis de voz (text-to-speech) en japonés derivado de Aratako/Irodori-TTS-v4.1-Small, publicado por el usuario summerAIO. No se trata de un modelo entrenado desde cero, sino de una modificación en el espacio de pesos (weight-space): el autor combina linealmente tres checkpoints públicos MIT para obtener un modelo orientado a la inferencia más rápida posible en CPU. El resultado es un TTS de 773 millones de parámetros que sintetiza voz japonesa con clonación de hablante opcional.

La innovación principal es la combinación de un sampler MeanFlow de 4 pasos (procedente de la variante MF) con un "task vector" de calidad tomado del modelo Yomi de takuma104, más un parche de velocidad aplicado en tiempo de carga (fusión de proyecciones QKV y de las matrices SwiGLU, plegado de weight-norm en el códec DACVAE, RoPE en aritmética real y conversión a bf16 del DiT y del códec). Según la model card, esto reduce el RTF total de 2,959 a 0,602 en una VM CPU de 8 núcleos con 4 hilos, es decir, unas 4,91 veces más rápido que el modelo original con 40 pasos.

El modelo es relevante para quienes necesitan TTS japonés desplegable en hardware sin GPU: mantiene una similitud de hablante de 0,941 en clonación (frente a 0,937 del original) y un CER de clonación del 4,1% (mejor que el 6,2% del original), aunque a costa de un MOS ligeramente inferior (3,128 frente a 3,431) y un CER de lectura algo peor (2,0% frente a 1,5%). Requiere aplicar un parche de código al paquete oficial para permitir bf16 en CPU con estado ODE en fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con sampler MeanFlow; códec de audio DACVAE semántico japonés de 32 dimensiones |
| Parámetros totales | 773.261.345 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (DiT y códec); fp32 para el estado ODE; no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, claves oficiales sin fusionar; codec_folded_fp32.safetensors opcional) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Irodori-TTS original: un transformer de difusión (DiT) que genera latentes de audio a partir de texto y, opcionalmente, de una referencia de voz para clonación, y un códec DACVAE semántico específico para japonés que decodifica esos latentes a forma de onda. La parameterización del flujo es MeanFlow, con 4 NFE (evaluaciones de función) por defecto en lugar de los 40 pasos del modelo de rectified flow original.

No hubo entrenamiento ni actualizaciones de gradiente. El autor aplica una combinación lineal en el espacio de pesos: W = MF + 1,0 · (Yomi − v4.1), partiendo del checkpoint MeanFlow oficial. El escalar 1,0 se eligió empíricamente: en una pantalla estándar subió el MOS de 3,221 a 3,263 con el mismo CER, mientras que 0,5 rompía una locución de clonación (CER de clonación del 14,4%) y fue descartado. En un conjunto difícil de 10 frases, el MF sin modificar obtuvo mejores cifras (CER 24,6% / MOS 3,358 frente a 28,1% / 3,257), lo que el autor documenta como limitación. El parche de velocidad se aplica en carga mediante `speed_patch.py`: plegado de weight_norm del DACVAE, fusión de wq|wk|wv|gate en JointAttention y de w1|w3 en SwiGLU, sustitución de RoPE complejo por aritmética real y conversión a bf16 de DiT y códec. Además se requiere `code_patches/cpu_bf16_ode_fp32.patch` sobre el paquete oficial para permitir bf16 en CPU manteniendo el estado ODE en fp32.

## Capacidades

- Síntesis de voz en japonés a partir de texto (pipeline text-to-speech).
- Clonación de voz mediante fichero de referencia WAV (`--ref`).
- Inferencia rápida en CPU con sampler MeanFlow de 4 NFE.
- Ejecución en bf16 sobre CPU gracias al parche de código incluido.
- Control de hilos de ejecución (`--threads`) para ajustar al hardware disponible.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis por lotes en servidores sin GPU: el RTF total de 0,602 con 4 hilos permite generar audio más rápido que tiempo real en una VM CPU de 8 núcleos, adecuado para procesar guiones largos en pipelines nocturnos.
- Generación de audiolibros y contenido narrado en japonés: el CER de lectura del 2,0% y el MOS de 3,128 son suficientes para narración no crítica donde prima el coste por hora de CPU frente a la calidad máxima.
- Clonación de voz para doblaje o personalización: la similitud de hablante de 0,941 y el CER de clonación del 4,1% permiten generar locuciones con una voz de referencia concreta, útil para prototipos de asistentes con voz de marca.
- Integración en aplicaciones de escritorio o edge sin GPU: al requerir solo CPU con soporte bf16 y ~3,5 GB de repo, puede empaquetarse en herramientas locales de lectura o accesibilidad para usuarios japoneses.
- Pruebas A/B de rapidez frente a calidad: al existir el modelo hermano SUN (24 pasos, conservador) y este LUNA (4 pasos, turbo), un equipo puede comparar ambos sobre el mismo texto y referencia para elegir el punto de equilibrio.
- Investigación sobre modificación en espacio de pesos: el repositorio documenta la receta completa (task vectors, escalares, parches de velocidad), lo que sirve como caso de estudio reproducible para experimentos de merging sin reentrenamiento.
- Generación de avisos y locuciones cortas en sistemas embebidos: con el DiT en 0,105 de RTF, el cuello de botella es la decodificación del códec, de modo que frases cortas se resuelven en tiempos compatibles con interfaces interactivas.

## Benchmarks y rendimiento

Condiciones: VM Grok Bot solo CPU, 8 núcleos, 4 hilos; 40 locuciones planas y 10 de clonación; watermarking desactivado; el original usa 40 pasos de rectified flow en fp32 sin parche de velocidad.

| Modelo | RTF total | RTF modelo | CER | CER kana | MOS | CER clonación | CER kana clonación | MOS clonación | Similitud hablante |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original (v4.1-Small) | 2,959 | 2,170 | 1,5% | 0,8% | 3,431 | 6,2% | 5,0% | 2,956 | 0,937 |
| LUNA / Final B (Turbo) | 0,602 | 0,105 | 2,0% | 1,2% | 3,128 | 4,1% | 3,9% | 2,970 | 0,941 |

Velocidad relativa (RTF total frente al original): original 1,00×; LUNA 4,91×.

## Requisitos de hardware

- VRAM: no aplica para el escenario objetivo (CPU); en GPU, el checkpoint en bf16 ocupa aproximadamente 1,5 GB de pesos más el códec y activaciones, aunque no se publican cifras de VRAM.
- CPU: probado en VM de 8 núcleos con 4 hilos; requiere soporte de bf16 en CPU y el parche `cpu_bf16_ode_fp32.patch`.
- GPU recomendadas: no documentadas por el autor; el modelo está optimizado y validado exclusivamente en CPU.
- Cabe en GPU de consumo por tamaño (773 M de parámetros), pero no hay datos de rendimiento en GPU publicados.
- Despliegue: paquete oficial Irodori-TTS con `speed_patch.py` y `synthesize.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF total 0,602 y RTF de modelo 0,105 con 4 hilos; el tiempo de pared restante lo domina la decodificación del códec.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Small-LUNA (este) | 773 M | no disponible | TTS japonés, MeanFlow 4 NFE, parche de velocidad | MIT | Hugging Face |
| Aratako/Irodori-TTS-v4.1-Small | no disponible | no disponible | TTS japonés, rectified flow 40 pasos | MIT | Hugging Face |
| Aratako/Irodori-TTS-v4.1-Small-MF | no disponible | no disponible | TTS japonés, MeanFlow 4 NFE sin task vector | MIT | Hugging Face |
| summerAIO/Irodori-TTS-v4.1-Small-SUN | no disponible | no disponible | TTS japonés, Yomi + parche conservador, 24 pasos RF | MIT | Hugging Face |

## Limitaciones y advertencias

- Solo soporta japonés; no hay capacidades multilingües documentadas.
- El MOS baja de 3,431 a 3,128 y el CER de lectura sube de 1,5% a 2,0% respecto al original: es un intercambio deliberado de calidad por velocidad.
- En el conjunto difícil de 10 frases, el modelo base MF sin modificar supera a LUNA (CER 24,6% / MOS 3,358 frente a 28,1% / 3,257), por lo que el rendimiento en textos difíciles es inferior.
- Requiere aplicar un parche al paquete oficial; sin él, bf16 en CPU falla o deriva numéricamente.
- Riesgo de alucinación y artefactos de pronunciación en textos ambiguos o fuera de dominio no cuantificado en la model card.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de CER y MOS.
- Licencia MIT compatible con uso comercial, pero se apoya en checkpoints de terceros (Aratako, takuma104) cuya licencia MIT se hereda; conviene verificar las condiciones de los modelos base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- El autor solo publica el checkpoint "Final B (Turbo)"; el modelo de calidad conservadora está en un repositorio separado (SUN).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/Irodori-TTS-v4.1-Small-LUNA
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Variante MeanFlow: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Fuente de calidad (Yomi): https://huggingface.co/takuma104/Irodori-TTS-v4.1-Small-Yomi
- Códec de audio: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Modelo hermano de calidad: https://huggingface.co/summerAIO/Irodori-TTS-v4.1-Small-SUN
