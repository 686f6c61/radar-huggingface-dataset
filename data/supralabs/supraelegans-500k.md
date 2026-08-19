# SupraLabs/SupraElegans-500k

## Resumen

SupraElegans-500K es un modelo de lenguaje causal de aproximadamente 500.000 parámetros desarrollado por SupraLabs. Su principal característica es que no utiliza una arquitectura Transformer: en su lugar, emplea un grafo neuronal recurrente, disperso y con conexiones con signo, inspirado de forma laxa en el sistema nervioso del nematodo *C. elegans*. El modelo no dispone de mecanismo de atención, ni de codificación posicional, ni de caché KV; el contexto se mantiene mediante un potencial de membrana persistente por neurona que se actualiza token a token.

Se trata de una primera versión experimental cuyo objetivo es comprobar si este tipo de arquitectura puede realizar modelado de lenguaje útil a muy pequeña escala, sin pretender competir en calidad con los Transformers. El modelo está entrenado con un presupuesto de tokens reducido y no ha sido afinado para seguir instrucciones ni para garantizar veracidad. A pesar de su tamaño diminuto, resulta relevante como banco de pruebas para arquitecturas alternativas basadas en dinámicas recurrentes y conectividad dispersa.

La licencia es Apache 2.0 y el modelo está pensado para generación de texto en inglés. Incluye código personalizado (`modeling_supraelegans.py`) que debe registrarse localmente para su carga en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente dispersa con signo (no Transformer) |
| Parametros totales | ~500.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada (contexto implícito en el estado recurrente persistente) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se compone de una población de neuronas dividida en tres grupos: sensoriales, interneuronas/asociación y de salida. Cada token se proyecta desde su embedding a las neuronas sensoriales; a continuación, el grafo recurrente ejecuta un número fijo de micro-pasos de propagación (3 por defecto) y finalmente las neuronas de salida se proyectan a los logits del vocabulario. La conectividad es dispersa y dirigida, con un fan-in/fan-out del orden de 10-20 aristas por neurona, y no se materializa ninguna matriz densa de pesos: la propagación se realiza mediante scatter-add sobre las aristas.

La dinámica de cada neurona sigue la ecuación `v[t+1] = clamp(leak_i * v[t] + incoming[t] + bias_i, -6, 6)` y la activación `a[t+1] = tanh(v[t+1] - threshold_i)`, donde `leak`, `bias` y `threshold` son parámetros aprendidos por neurona. La señal entrante se escala por `1/sqrt(fan-in promedio)` para controlar la varianza. El potencial de membrana no se reinicia entre tokens, lo que proporciona una forma de memoria a largo plazo que actúa como ventana de contexto. No se menciona el número de tokens de entrenamiento ni la composición del dataset; solo se indica que se usó un presupuesto de tokens pequeño. No se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva: el modelo produce texto token a token, guiado únicamente por el estado recurrente persistente.
- Contexto implícito: la memoria a largo plazo reside en el potencial de membrana, sin necesidad de caché KV.
- Procesamiento secuencial: adecuado para estudiar dinámicas recurrentes en modelado de lenguaje.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: ninguna (sin visión, audio, ni modo de pensamiento explícito).

## Casos de uso

- Investigación en arquitecturas no-Transformer: sirve como plataforma para estudiar si redes recurrentes dispersas pueden aprender patrones lingüísticos básicos con muy pocos parámetros.
- Prototipado de bajo coste: al requerir recursos mínimos, permite experimentar con dinámicas de estado persistente en entornos sin GPU.
- Educación y divulgación: útil para ilustrar conceptos de conectividad dispersa, neuronas con signo y memoria recurrente en clases de aprendizaje automático.
- Análisis de escalabilidad: permite comparar el comportamiento de una arquitectura recurrente frente a un Transformer de tamaño similar, aunque aún no se ha realizado esa comparación.
- Generación de texto experimental: puede emplearse para producir fragmentos de texto cortos con fines de demostración, asumiendo una calidad limitada.
- Desarrollo de técnicas de control de estado: al exponer el estado interno (`init_state`, `step_token`), facilita la experimentación con manipulación directa de la memoria del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido comparado contra un Transformer de parámetros equivalentes y que cualquier afirmación sobre capacidades debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada: al tratarse de ~500.000 parámetros, el modelo ocupa menos de 2 MB en precisión fp32; la inferencia es viable en CPU sin necesidad de GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi podría ejecutarlo, aunque con latencia mayor.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier equipo moderno, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: requiere `transformers` y el código personalizado `modeling_supraelegans.py`; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser una red recurrente con propagación por scatter-add, la latencia depende del número de micro-pasos y del tamaño del grafo, pero se espera que sea baja en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (redes recurrentes dispersas de ~500k parámetros) en la información proporcionada. Una comparación con un Transformer pequeño (por ejemplo, GPT-2 de 124M) sería posible, pero no se dispone de datos de rendimiento del SupraElegans para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Modelo experimental: es una primera versión sin ajuste fino para calidad, instrucciones o factualidad; la coherencia del texto será limitada.
- Sin benchmarks verificados: no hay resultados publicados que respalden capacidades concretas.
- Riesgo de alucinación: al no estar entrenado para veracidad, puede generar contenido inventado o incoherente.
- Idioma restringido: solo inglés; no soporta otros idiomas.
- Dependencia de código personalizado: requiere cargar `modeling_supraelegans.py` localmente; el uso con `trust_remote_code` puede fallar si el `config.json` no incluye `auto_map`.
- Compatibilidad con `transformers`: la carga del tokenizer puede fallar con versiones antiguas si `tokenizer_config.json` contiene una clase no reconocida; se recomienda usar `PreTrainedTokenizerFast` directamente.
- Sin soporte para tareas avanzadas: no dispone de tool calling, agentes, visión ni audio.
- Licencia Apache 2.0: permite uso comercial, pero al ser experimental, no se recomienda para producción.

## Enlaces

- [HuggingFace: SupraLabs/SupraElegans-500k](https://huggingface.co/SupraLabs/SupraElegans-500k)
- No se proporcionan otros enlaces (papers, blogs, repos) en la información disponible.
