# summerAIO/Irodori-TTS-v4.1-Small-SUN

## Resumen

Irodori-TTS-v4.1-Small-SUN es un checkpoint derivado del modelo de síntesis de voz japonesa Aratako/Irodori-TTS-v4.1-Small, publicado por el usuario summerAIO. No se trata de un modelo entrenado desde cero: es una modificación en espacio de pesos (weight-space) que combina el checkpoint base con la task vector del modelo Yomi (takuma104/Irodori-TTS-v4.1-Small-Yomi), aplicando además un parche de velocidad conservador y un muestreador de flujo rectificado de 24 pasos en lugar de los 40 originales. El objetivo es doble: mejorar ligeramente la calidad de clonación de voz y reducir el coste computacional en CPU sin reentrenar.

El modelo tiene 766 millones de parámetros y está especializado exclusivamente en japonés (ja). Su relevancia radica en que demuestra una técnica de optimización práctica —fusión de operadores, folding de weight-norm, RoPE en aritmética real y paso del DiT a bf16— que permite casi triplicar la velocidad de inferencia en entornos sin GPU manteniendo la inteligibilidad. Todo el trabajo de modificación y evaluación se realizó en una VM CPU-only de 8 núcleos.

La licencia es MIT, heredada de los modelos base, lo que facilita su uso comercial. El repositorio ocupa 9,3 GB e incluye los pesos en safetensors, el script de parcheo en tiempo de carga, un parche de código para habilitar bf16 en CPU y un script de síntesis de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (diffusion transformer) con flujo rectificado y codec DACVAE semántico |
| Parametros totales | 766.052.385 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (DiT) y fp32 (codec); no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Irodori-TTS: un diffusion transformer (DiT) que opera con flujo rectificado (rectified flow) sobre representaciones de un codec de audio semántico, en este caso DACVAE japonés de 32 dimensiones (Aratako/Semantic-DACVAE-Japanese-32dim). La síntesis se realiza mediante integración ODE con classifier-free guidance. No se ha realizado ningún entrenamiento nuevo: los pesos resultan de la combinación lineal W = v4.1 + 1.0 · (Yomi − v4.1), idéntica al checkpoint Yomi de takuma104, elegido porque en un conjunto de cribado mejoró UTMOS frente al base (3,543 frente a 3,328) y redujo el CER de clonación (4,4 % frente a 6,2 %).

Las innovaciones técnicas son de optimización en tiempo de carga, aplicadas por `speed_patch.py`: folding exacto de `weight_norm` del DACVAE en convoluciones ordinarias; fusión de `wq|wk|wv|gate` en JointAttention y de `w1|w3` en SwiGLU; sustitución de RoPE complejo por aritmética real; activación Snake in-place en el codec; y conversión del DiT a bf16 manteniendo el codec en fp32. Además se reduce el muestreador de 40 a 24 pasos de flujo rectificado. Requiere aplicar `code_patches/cpu_bf16_ode_fp32.patch` al paquete oficial `irodori_tts` para permitir bf16 en CPU y mantener el estado ODE y CFG en fp32; sin él, la inferencia en CPU bf16 falla o deriva numéricamente.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto.
- Clonación de voz zero-shot mediante audio de referencia (`--ref`).
- Generación con muestreador de flujo rectificado configurable (24 pasos por defecto en este checkpoint).
- Ejecución en CPU con bf16 en el DiT y fp32 en el codec, con parche de estabilidad numérica.
- Inferencia multihilo (parámetro `--threads`, probado con 4 hilos).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto a la referencia de voz ni razonamiento multi-paso.

## Casos de uso

- Síntesis de voz para aplicaciones japonesas en servidores sin GPU: el modelo está optimizado para CPU-only y alcanza RTF total de 1,110 con 4 hilos, lo que permite generar audio en tiempo cercano al real en hardware modesto.
- Clonación de voz para doblaje o audiolibros: con `--ref` se puede replicar un timbre concreto; el CER de clonación medido es del 4,9 %, inferior al 6,2 % del modelo original.
- Generación de avisos y locuciones automatizadas: al tener CER del 1,7 % en texto plano, es adecuado para contenidos donde la inteligibilidad es crítica (noticias, anuncios, interfaces de voz).
- Prototipado de asistentes conversacionales en japonés: la licencia MIT y el bajo coste de inferencia en CPU facilitan iterar en entornos de desarrollo sin infraestructura GPU.
- Investigación en modificación de pesos: el repositorio sirve como referencia reproducible de task arithmetic, folding de weight-norm y fusión de operadores aplicados a un TTS.
- Despliegue en dispositivos edge o contenedores limitados: al no requerir GPU y admitir bf16 en CPU, puede integrarse en pipelines de generación de audio por lotes en máquinas de 8 núcleos.
- Evaluación comparativa de muestreadores: permite estudiar el compromiso entre pasos de flujo rectificado (24 frente a 40) y calidad, con métricas CER y UTMOS documentadas.

## Benchmarks y rendimiento

Condiciones: VM CPU-only de 8 núcleos, 4 hilos, 40 enunciados planos y 10 de clonación, watermarking desactivado. El original usa los valores por defecto oficiales (40 pasos RF, fp32, sin parche de velocidad).

| Modelo | RTF total | RTF modelo | CER | CER kana | MOS | CER clon | CER kana clon | MOS clon | Similitud de hablante |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Original (v4.1-Small) | 2,959 | 2,170 | 1,5 % | 0,8 % | 3,431 | 6,2 % | 5,0 % | 2,956 | 0,937 |
| SUN / Final A (Quality-safe) | 1,110 | 0,550 | 1,7 % | 1,0 % | 3,452 | 4,9 % | 4,4 % | 2,891 | 0,934 |

Velocidad relativa (RTF total frente al original): Original 1,00×; SUN 2,67×.

## Requisitos de hardware

- VRAM estimada: no aplica para el escenario documentado (inferencia en CPU); en GPU no se proporcionan cifras.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU.
- Cabe en consumer GPU: no disponible; los pesos suman 766 M de parámetros, pero no se han publicado requisitos de VRAM.
- Opciones de despliegue: paquete oficial `irodori-tts` con el parche `cpu_bf16_ode_fp32.patch`, script `synthesize.py` incluido y `speed_patch.py` para folding/fusión en tiempo de carga. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF total de 1,110 y RTF de modelo de 0,550 con 4 hilos en CPU de 8 núcleos; el original marca 2,959 y 2,170 respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (plano) | CER (clon) | MOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Small-SUN | 766 M | no disponible | 1,7 % | 4,9 % | 3,452 | MIT | Hugging Face |
| Irodori-TTS-v4.1-Small (original) | 766 M | no disponible | 1,5 % | 6,2 % | 3,431 | MIT | Hugging Face |
| Irodori-TTS-v4.1-Small-Yomi | no disponible | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |
| Irodori-TTS-v4.1-Small-LUNA (turbo) | no disponible | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- Solo soporta japonés; no se documenta multilingüismo.
- Requiere aplicar un parche al paquete oficial `irodori_tts`; sin él, la inferencia en CPU con bf16 falla o produce deriva numérica.
- El CER en texto plano empeora ligeramente frente al original (1,7 % frente a 1,5 %) y el MOS de clonación baja (2,891 frente a 2,956), aunque la similitud de hablante es similar (0,934 frente a 0,937).
- Los benchmarks se limitaron a 50 enunciados en una única VM CPU; no hay validación en GPU ni en otros entornos.
- Riesgo de alucinación y artefactos propio de modelos TTS: no se documentan análisis de sesgos ni de robustez ante texto fuera de dominio.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones de los modelos base y del codec DACVAE redistribuidos.
- No se documentan capacidades de tool calling, agentes ni otras modalidades; el uso está acotado a TTS.
- El repositorio contiene únicamente el checkpoint Final A; el modelo turbo (LUNA) se distribuye por separado.

## Enlaces

- Hugging Face: https://huggingface.co/summerAIO/Irodori-TTS-v4.1-Small-SUN
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Fuente de calidad (Yomi): https://huggingface.co/takuma104/Irodori-TTS-v4.1-Small-Yomi
- Codec de audio: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Modelo turbo hermano: https://huggingface.co/summerAIO/Irodori-TTS-v4.1-Small-LUNA
