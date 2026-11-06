# sulabhkatiyar/sravaani-p2-k1

## Resumen

SraVaani P2-K1 es un ajuste fino piloto de un modelo de reconocimiento automático del habla (ASR) desarrollado por Sulabh Katiyar, construido sobre SraVaani-1.0, un FastConformer híbrido con decodificación TDT-CTC de aproximadamente 449 millones de parámetros. El modelo se distribuye a través de Hugging Face con la librería NeMo 2.4.0 y emplea un tokenizador SentencePiece de 5000 unidades (SPM-5000). Su propósito es extender las capacidades del modelo base hacia el inglés, manteniendo a la vez una proporción mayoritaria de datos de replay en lenguas índicas (al menos el 60 %).

El modelo se entrenó sobre el corpus `sulabhkatiyar/sravaani-train-v1@abc`, compuesto por 78 fuentes y 2.787 horas de audio. El autor lo describe explícitamente como un piloto corto y no como un lanzamiento estable: su función es servir de referencia reproducible para una ejecución posterior en hardware AMD MI300X. Esta naturaleza de "reference run" condiciona su madurez: los artefactos publicados incluyen pesos, logs por paso, configuraciones y un paquete de paridad entre hardware, pero no una evaluación de benchmarks estándar publicada.

La relevancia del modelo reside en su enfoque de ingeniería: documenta un flujo completo de ajuste fino full-parameter con precisión mixta (fp16 + GradScaler) sobre 2× NVIDIA T4 (entorno Kaggle), con un plan de entrenamiento definido (15.743 pasos máximos, evaluación cada 1.300 pasos, guardado cada 1.050 pasos) y un presupuesto de tiempo de 18.888 segundos. Es, por tanto, más útil como referencia de reproducibilidad y paridad entre aceleradores que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido con decodificación TDT-CTC (NeMo) |
| Parametros totales | ~449 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | inglés e índicas (según tags: `indic`, `english`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state_dict fp32, model-only) + `.nemo` base requerido para carga |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer, variante eficiente del Conformer que reduce el coste computacional de la atención mediante subsampling convolucional, combinada con una cabeza de decodificación híbrida TDT-CTC. La decodificación TDT (Token-and-Duration Transducer) emite tokens junto con predicciones de duración, lo que permite saltos temporales adaptativos y reduce el número de pasos de decodificación frente a un transducer clásico. El tokenizador es un SentencePiece de 5.000 unidades, coherente con un vocabulario multilingüe compacto orientado a lenguas índicas e inglés.

El ajuste fino se realizó sobre 2.787 horas de audio provenientes de 78 fuentes, con una política de replay que garantiza al menos un 60 % de datos índicos para mitigar el olvido catastrófico al introducir inglés. Se aplicó full fine-tuning con learning rate 1e-5, LLRD (layer-wise learning rate decay) de 0,9, BatchNorm congelado y una función de pérdida combinada TDT + CTC. El entrenamiento usó fp16 con GradScaler (inicializado a 1024) sobre 2× T4. El plan registra 15.743 pasos máximos, evaluación cada 1.300 pasos y guardado/resume cada 1.050 pasos, con un presupuesto de 18.888 segundos y una estimación de 0,85 s por paso en la sonda de rendimiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y lenguas índicas, con vocabulario SentencePiece de 5.000 tokens.
- Decodificación híbrida TDT-CTC, que permite elegir entre decodificación transducer (TDT) y CTC según el compromiso latencia/precisión.
- Manejo de audio multilingüe con mezcla controlada de dominios (replay índico mayoritario).
- Alineación temporal mediante predicciones de duración del decoder TDT.
- Carga y ejecución dentro del ecosistema NeMo 2.4.0, con integración en pipelines de `nemo_toolkit`.
- Soporte de evaluación en modo eval con sondas de pérdida documentadas en el paquete de paridad.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.
- No se documenta modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Transcripción de audio en inglés con acento no nativo: el ajuste hacia inglés sobre un modelo base índico lo hace adecuado para hablantes de inglés con L1 índica, un nicho mal cubierto por modelos ASR genéricos.
- Subtitulado y transcripción de contenido educativo o divulgativo en lenguas índicas: el replay mayoritario (≥60 %) preserva el rendimiento en esas lenguas tras el ajuste.
- Investigación en paridad entre aceleradores: el paquete `parity/` con lotes exactos, trazas y pérdidas en modo eval permite validar que una ejecución en AMD MI300X reproduce los resultados de la referencia en T4.
- Reproducción de experimentos de fine-tuning ASR: los logs por paso, configuraciones y el informe de ejecución permiten replicar el pipeline completo en NeMo 2.4.0.
- Base para ajustes posteriores en dominios específicos (call centers, atención al cliente) con datos propios, partiendo de los pesos `avg_last<K>` promediados.
- Evaluación comparativa de decodificadores TDT frente a CTC sobre el mismo checkpoint, útil para estudiar el compromiso entre WER y latencia.
- Prototipado de ASR en entornos con recursos limitados (2× T4), dado que el modelo de 449 M parámetros cabe en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de WER, MMLU, HumanEval ni métricas comparativas; únicamente describe el plan de entrenamiento y los artefactos de paridad y evaluación final, sin cifras de rendimiento publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en fp32 (model-only state_dict) y el repo ocupa 3,6 GB; en fp16 la inferencia ronda los 1-2 GB de VRAM para el modelo, más overhead de NeMo y buffers de audio.
- GPU recomendadas: el autor documenta entrenamiento en 2× NVIDIA T4 (16 GB cada una); la inferencia cabe holgadamente en una sola T4.
- Cabe en GPU de consumo: sí, en cualquier GPU con ≥4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque NeMo puede requerir más memoria por el runtime.
- Opciones de despliegue: NeMo 2.4.0 (carga vía `model.load_state_dict(torch.load(path))` tras restaurar el `.nemo` base); no se documenta soporte de vLLM, llama.cpp ni Ollama (no aplicables a ASR).
- Latencia y throughput: no disponible; el plan de entrenamiento menciona 0,85 s por paso en la sonda, pero no se publican cifras de inferencia (RTF).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SraVaani P2-K1 | ~449 M | no disponible | inglés + índicas | MIT | Hugging Face (piloto) |
| Whisper large-v3 (OpenAI) | ~1.550 M | 30 s de audio | multilingüe amplio | MIT | Hugging Face, ampliamente desplegado |
| NVIDIA Parakeet-TDT (NeMo) | ~600 M | no disponible | inglés | CC-BY-4.0 | NGC / Hugging Face |
| IndicWav2Vec / IndicConformer | variable | no disponible | índicas | variable | Hugging Face |

La comparación es orientativa: no se dispone de métricas de WER publicadas para SraVaani P2-K1, por lo que no es posible establecer una comparación cuantitativa de rendimiento con las alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que es un piloto corto y no un lanzamiento; no debe tratarse como un modelo estable para producción.
- No se publican métricas de WER ni evaluaciones de benchmarks; el rendimiento real es desconocido.
- Riesgo de olvido catastrófico parcial en lenguas índicas pese al replay ≥60 %, no cuantificado.
- Los pesos se distribuyen como state_dict fp32 model-only; requieren restaurar el `.nemo` de SraVaani-1.0 con NeMo 2.4.0, lo que añade complejidad de despliegue y dependencia de versión.
- No se documentan sesgos específicos, pero un corpus de 78 fuentes puede introducir sesgos de dominio, género y acento no caracterizados.
- Licencia MIT: permite uso comercial, pero al ser un piloto sin evaluación, el usuario asume el riesgo de calidad.
- No se documentan cuantizaciones ni formatos optimizados (GGUF, ONNX), lo que limita el despliegue en entornos no NeMo.
- El modelo está orientado a ASR; no cubre otras tareas (traducción, diálogo, tool calling).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/sravaani-p2-k1
- Perfil del autor en Hugging Face: https://huggingface.co/sulabhkatiyar/models
- Sitio personal del autor: https://sulabhkatiyar.pages.dev/
- NeMo Toolkit (framework requerido): https://github.com/NVIDIA/NeMo
- Paper de FastConformer: https://arxiv.org/abs/2305.05084
- Paper de TDT (Token-and-Duration Transducer): https://arxiv.org/abs/2304.06795
