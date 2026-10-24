# zhangjiaxin2012/SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT1024-Think4K-v2

## Resumen

SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT1024-Think4K-v2 es un checkpoint de investigación derivado de `google/gemma-4-31B-it`, publicado por el usuario zhangjiaxin2012 dentro del proyecto SRF-Jev. Se trata de un modelo completo de 31.273.086.512 parámetros (31,27 B) exportado de forma nativa, sin adaptadores LoRA pendientes de fusión, pensado para estudiar la supervisión de tokens de razonamiento mediante SFT sobre una arquitectura multimodal de la familia Gemma 4 (`Gemma4ForConditionalGeneration`).

El autor lo describe explícitamente como una instantánea intermedia de investigación ("stage snapshot"), no como un ganador final de la v2 ni como un lanzamiento SOTA oficial. La etiqueta `Think4K` no designa un modelo "solo de pensamiento", sino una receta de inferencia: los mismos pesos soportan una política `direct` (una única pasada de decisión, cero tokens generados) y una política `autothink4096` con pensamiento nativo condicionado a una puerta de confianza y limitado a 4096 tokens.

Su interés actual es metodológico: publica resultados sobre un panel propio de 231 preguntas comparando ambas políticas, con métricas de calibración (NLL, Brier), e incluye el código de inferencia y el manifiesto de publicación. No obstante, no aporta evaluaciones de referencia estándar (MMLU, HumanEval, GSM8K) ni validación de despliegue cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con cabecera condicional multimodal; clase nativa `Gemma4ForConditionalGeneration` |
| Parametros totales | 31.273.086.512 (31,27 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en sus dtypes nativos sin conversion ni cuantizacion, y la inferencia medida carga BF16 |
| Idiomas soportados | inglés (campo `language: en`) |
| Licencia | apache-2.0 (modelo base: `google/gemma-4-31B-it`) |
| Formato de pesos | safetensors (`model*.safetensors`) con config, index y tokenizer nativos; tamano del repo 62,6 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/gemma-4-31B-it@842da3794eaa0b77d5f08bae87a17459d91ff475` y conserva la arquitectura nativa `Gemma4ForConditionalGeneration`. El entrenamiento se organiza en tres fases declaradas: Stage1 (SFT completo de decisión, con `enable_thinking=False` y supervisión del resultado de la decisión), Stage2 (LoRA causal de decisión sobre ese escenario, con supervisión del resultado y *replay*) y Stage3 (SFT de razonamiento, con prompts de pensamiento nativos y supervisión o rollouts de tokens de razonamiento). Esta última fase es la que da nombre al checkpoint: 1.024 actualizaciones con LoRA de atención de rango 32 y alpha 64, optimizador AdamW en FP32 y tasa de aprendizaje 1e-5, seguida de una exportación nativa fusionada. No hubo actualizaciones posteriores de RL sobre el conjunto del idioma.

La innovación destacable no está en la arquitectura, sino en la receta de servicio. La política `direct` realiza un único prefill de decisión sin generar razonamiento. La política `autothink4096` lee primero sin pensar y solo genera pensamiento nativo cuando `max(p0) < 0,9`, con un tope de 4.096 tokens; después aplica una reinserción fija del análisis y fusiona probabilidades con `0,25*p0 + 0,75*p1`. El autor advierte que activar `enable_thinking=True` en una llamada de chat genérica no reproduce ese sistema: la política, el mapeo de opciones y el presupuesto de razonamiento forman parte del artefacto evaluado.

## Capacidades

- Generación de texto conversacional y razonamiento en inglés, con soporte de modo de pensamiento nativo limitado a 4.096 tokens.
- Decisión sobre opciones con salida probabilística: el runner entrega identificadores semánticos de opción, probabilidades, la opción seleccionada y recuentos reales de tokens y de topes aplicados.
- Política adaptativa de coste: `direct` para latencia o coste mínimo y `autothink4096` con puerta de confianza `max(p0) < 0,9`.
- Fusión calibrada de dos pasadas (`0,25*p0 + 0,75*p1`) tras reinserción del análisis en JSON.
- Capacidad de entrada imagen-texto por arquitectura y etiqueta `image-text-to-text`; no se documentan evaluaciones de visión en la model card.
- Soporte de *tool calling*, *function calling* o flujos de agentes multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no declaradas; el modelo se publica únicamente para inglés.

## Casos de uso

- Investigación sobre SFT con supervisión de tokens de razonamiento: el checkpoint permite reproducir la comparación entre `direct` y `autothink4096` sobre paneles propios, con presupuesto de razonamiento controlado y métricas de calibración registradas.
- Enrutado o triaje con coste controlado: usar `direct` como primera pasada y derivar a `autothink4096` solo cuando la confianza máxima sea inferior a 0,9, lo que evita generar hasta 4.096 tokens en los casos fáciles.
- Clasificación y decisión entre opciones con probabilidades calibradas (por ejemplo, evaluación de solicitudes o categorización de incidencias), aprovechando las salidas de probabilidad y los identificadores semánticos de opción en lugar de texto libre.
- Auditoría de calibración: el panel de 231 preguntas y las métricas NLL y Brier permiten medir si las probabilidades del modelo son utilizables como señal de confianza antes de integrarlo en un pipeline.
- Base para nuevos fine-tunes: al ser un export nativo fusionado, no requiere adjuntar ni fusionar LoRA manualmente, lo que simplifica arrancar experimentos posteriores desde un artefacto íntegro.
- Reproducción de experimentos con trazabilidad: el repo incluye `release.json`, `release-files.json` y `evaluation.json`, y admite `--revision <commit>` y `--verify-weights` para fijar la identidad exacta del artefacto y verificar cada shard.
- Estudio de robustez frente al orden de opciones: los identificadores estables determinan la permutación de opciones ciega a etiquetas y la semilla de pensamiento, lo que permite analizar sensibilidad al ordenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el panel propio "Public231" (231 preguntas de desarrollo adaptativo; no son puntuaciones oficiales de leaderboard). `Capability = (Intelligence + Calibration) / 2` y es distinta de la exactitud de respuesta.

| Política | Aciertos / 231 | Exactitud | Intelligence | Calibration | Capability | NLL ↓ | Brier ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Direct | 204 | 88,31 % | 71,99 | 80,58 | 76,28 | 0,391213 | 0,178652 |
| Gated 4K thinking | 223 | 96,54 % | 89,64 | 87,34 | 88,49 | 0,203630 | 0,073238 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica además que la matriz por etapas no muestra una ganancia uniforme en modo `direct` y que, en las comparaciones completadas de 31B, el modelo base original sigue liderando en "Direct Capability".

## Requisitos de hardware

- VRAM estimada en BF16: solo los pesos ocupan aproximadamente 62,5 GB (31,27 B × 2 bytes); con caché KV y activaciones conviene reservar por encima de 64-70 GB.
- GPU de referencia: el runner de decisión se ejecuta en una única GPU CUDA con SDPA en modo math-only, y la configuración de referencia citada es H200 (141 GB), donde el modelo cabe con margen amplio.
- H100 80 GB y A100 80 GB: los pesos caben, pero con muy poco margen para caché KV y contexto largo; no se documenta ningún ajuste de memoria para estos perfiles.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090) ni de 48 GB. No se ha validado ninguna cuantización para reducir el requisito, por lo que no hay cifras fiables para 4 bits u 8 bits.
- Multi-GPU: no validado; el runner suministrado asume un solo dispositivo CUDA y los backends multi-GPU o cuantizados se describen como configuraciones de evaluación separadas.
- Despliegue: `transformers` 5.17.0 con `dtype=torch.bfloat16` y `attn_implementation="sdpa"`, o el código propio `predict.py` (PyTorch 2.6.0 con build CUDA, `huggingface_hub` 1.5.0, Python 3.10+). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste depende fuertemente de la política: `direct` genera cero tokens, mientras que `autothink4096` puede añadir hasta 4.096 tokens de razonamiento por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT1024-Think4K-v2 | 31,27 B | no disponible | 88,31 % (direct) y 96,54 % (gated 4K) en panel propio de 231 preguntas; sin benchmarks estándar | apache-2.0 declarada en el repo | HuggingFace, 0 descargas, 0 likes; código de inferencia incluido |
| google/gemma-4-31B-it (base) | 31 B | no disponible | Lidera en "Direct Capability" según la propia model card; sin cifras del panel en la información disponible | según el modelo base (verificar términos) | HuggingFace, modelo oficial |
| Otras alternativas de 30-35 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos verificables de otros modelos comparables de la misma categoría, por lo que la comparación se limita al modelo base declarado.

## Limitaciones y advertencias

- Instantánea de investigación: el autor la describe como "v2 research-stage snapshot", no como ganador final de la v2 ni como lanzamiento SOTA oficial, con ablaciones heredadas nombradas explícitamente.
- En modo `direct` no se observa una mejora uniforme frente al modelo base; de hecho, el base original sigue liderando en "Direct Capability" en las comparaciones completadas de 31B.
- Los resultados de 231 preguntas provienen de un panel de desarrollo adaptativo del propio autor, con costes de razonamiento distintos por checkpoint; no son puntuaciones oficiales de leaderboard.
- El sistema evaluado incluye política, prompt, mapeo de opciones y presupuesto de razonamiento. Un chat genérico o `enable_thinking=True` no reproduce la tabla de decisión.
- Los identificadores de entrada deben mantenerse estables entre políticas, ya que determinan la permutación de opciones ciega a etiquetas y la semilla del pensamiento; las etiquetas de referencia deben guardarse en un fichero aparte.
- Solo inglés declarado: no hay soporte multilingüe documentado.
- Riesgo de alucinación y de sobreconfianza: no se publican evaluaciones de seguridad, sesgos ni robustez; las métricas de calibración son internas al panel del autor.
- Sin validación de cuantización ni de backends multi-GPU o de alto throughput: el runner suministrado usa un solo dispositivo CUDA con SDPA math-only.
- La licencia declarada en el repositorio es apache-2.0, pero el modelo deriva de `google/gemma-4-31B-it`; conviene verificar los términos aplicables del modelo base antes de un uso comercial.
- No se publican estados del optimizador, registros de entrenamiento o evaluación, etiquetas, logs internos ni sondas privadas de ejecución, lo que limita la reproducibilidad completa del proceso.
- El artefacto tiene verificación de exportación y recarga, y el código portable se comprueba en CPU contra capturas guardadas, pero el autor no presenta esa repetición como una prueba nueva de portabilidad GPU mediante la CLI.
- Perfil de adopción nulo en el momento de la ficha (0 descargas, 0 likes) y fecha de creación posterior a la información de referencia disponible: tratar como artefacto experimental, no como dependencia de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT1024-Think4K-v2
- Repositorio del proyecto SRF-Jev: https://github.com/jxzhangjhu/srf-jev
- Documentación de la comparativa de tres tamanos: https://github.com/jxzhangjhu/srf-jev/tree/main/docs/gemma4/research/three-size-20261023
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
