# Yuyang-z/rbdj-tsc-ob6000-s40k

## Resumen

`rbdj-tsc-ob6000-s40k` es un checkpoint de investigación publicado por el usuario Yuyang-z en HuggingFace. Se trata de un modelo de mundo (world model) y de acción para robótica, construido sobre la arquitectura SANA-RWM y entrenado mediante SFT sobre cadenas de episodios completos del simulador RoboDojo con el brazo robótico ARX X5. El identificador interno del modelo, `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, revela las piezas principales: un transformer de difusión con flow matching ("self flow"), dos flujos acoplados (vídeo y acciones), acondicionamiento por cámara y multi-vista, y un tamaño aproximado de 5.000 millones de parámetros con 36 bloques de profundidad.

El modelo resuelve dos tareas complementarias: predecir observaciones futuras multi-vista a partir de acciones (modelo de mundo) y generar secuencias de acciones de efector final (EEF) a partir de instrucciones y contexto visual (modelo de política o *world-action model*). Trabaja sobre ventanas de episodio de entre 4 y 49 trozos de 32 acciones absolutas a 25 fps, con tres vistas de 256x320 píxeles codificadas en latentes de LTX-2.3. Es relevante porque combina en un único artefacto la capacidad de simular el entorno y de actuar en él, lo que habilita evaluación de políticas y planificación basada en modelo sin necesidad de ejecutar en hardware real.

El checkpoint corresponde a la época 41, paso 40.000, de un ajuste fino sobre el preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_ws256` (época 2, paso 6.000). El repositorio pesa 17,9 GB, no declara licencia, no incluye benchmarks y no registra descargas ni interacciones, por lo que debe tratarse como material experimental sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching ("self flow"), dos flujos acoplados (vídeo y acciones), atención con *sink* softmax y bloques de observación; acondicionado por cámara, multi-vista. Clase: `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36` |
| Parametros totales | Aproximadamente 5.000 millones (sufijo `5B` del identificador de clase); los 17,9 GB en fp32 consolidado son coherentes con ~4,5 B de parámetros efectivos |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | Ventanas de episodio de L = 4 a 49 trozos (*chunks*), cada trozo con 32 acciones EEF absolutas a 25 fps; equivale a entre 128 y 1.568 acciones (~0,16 s a 62,7 s de trayectoria). Ventana visual de 3 vistas a 256x320 píxeles |
| Tipos de cuantizacion | No disponible: solo se publican pesos consolidados en fp32; no se ofrecen variantes bf16, int8 ni GGUF |
| Idiomas soportados | No disponible: la model card no declara cobertura lingüística; las instrucciones se introducen como *token-group prompts* de texto |
| Licencia | No disponible: la model card y los metadatos de HuggingFace no especifican licencia |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (binario PyTorch consolidado, fp32), `metadata.pth`, `config.yaml`, `normalization/`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS`. No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un modelo generativo de difusión con flow matching (denominado "self flow" en el identificador) que mantiene dos flujos paralelos e interactuantes: uno de vídeo y otro de acciones. La variante `TwoStream` y el modificador `obsblock` indican un diseño de bloques de observación con un *sink* de atención softmax de horizonte 7, pensado para estabilizar rollouts autorregresivos largos. El sufijo `CameraConditionMultiView` señala que la generación está condicionada por la identidad de cada cámara y por las tres vistas simultáneas, y `D36` sugiere 36 bloques de profundidad. La componente `QwenNext` del nombre apunta a un codificador de texto de la familia Qwen para los prompts de instrucción. Los fotogramas se tokenizan con los latentes de LTX-2.3.

El entrenamiento es un SFT sobre cadenas de episodios completos generados en RoboDojo con el robot ARX X5, partiendo desde su primer fotograma, con ventanas de L = 4 a 49 trozos de 32 acciones EEF absolutas a 25 fps y tres vistas de 256x320. Se aplica la normalización definida por la receta de cadenas, *prompts* por grupos de tokens con *instruction dropout* de 0,1 y el contrato de datos descrito en `episode_chain_contract.json`. El checkpoint deriva del preentrenamiento `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_ws256` (época 2, paso 6.000) y del ajuste `SANA_RoboDojo_EpisodeChain_SFT_obsblock6000_kef8n`. No se documentan en la información disponible el volumen total de tokens, la composición exacta del dataset ni el uso de RLHF o DPO. La inferencia recomendada emplea CFG de vídeo 6, CFG de acción 1, 10 pasos de muestreo, *flow shifts* de 5 y 1, y prellenado del prefijo limpio mediante la caché `prefix_cache` de sana-rwm.

## Capacidades

- Generación de vídeo predictivo multi-vista: sintetiza observaciones futuras de tres cámaras a 256x320 píxeles condicionadas por acciones y por instrucción textual.
- Predicción de acciones de efector final: emite trozos de 32 acciones EEF absolutas a 25 fps, actuando como política de manipulación.
- Modelo de mundo condicionado por acción: dada una secuencia de acciones, predice la evolución visual del entorno, lo que permite simular el resultado de un plan.
- Rollouts autorregresivos de episodio largo: soporta ventanas de hasta 49 trozos con prellenado del prefijo limpio (`prefix_cache`) y *sink* de atención de horizonte 7.
- Acondicionamiento por cámara: distingue la identidad de cada vista, lo que habilita consistencia geométrica entre cámaras.
- Condicionamiento por instrucción en lenguaje natural mediante *token-group prompts* con *instruction dropout* durante el entrenamiento.
- No se documenta soporte de *tool calling*, *function calling*, uso de agentes, modo *thinking*, audio ni reconocimiento de voz; estas capacidades deben considerarse no disponibles.

## Casos de uso

- Política de manipulación en simulación: el modelo genera directamente secuencias de 32 acciones EEF a 25 fps para el robot ARX X5 en RoboDojo, por lo que puede sustituir a un controlador aprendido en *benchmarks* de manipulación simulada.
- Evaluación de políticas sin robot físico: dado un plan de acciones candidato, el flujo de vídeo predice las observaciones resultantes en las tres cámaras, lo que permite medir el éxito de la política antes de desplegarla en hardware.
- Generación de datos sintéticos para imitación: los rollouts del modelo de mundo producen pares (observación, acción) adicionales que pueden aumentar un conjunto de datos de entrenamiento escaso, con la ventaja de cubrir episodios completos de hasta 62,7 s.
- Planificación basada en modelo: integrado en un bucle de control predictivo (MPC) o de búsqueda, el modelo evalúa múltiples secuencias de acciones cortas y selecciona la que maximiza la probabilidad de la trayectoria objetivo.
- Inicialización para *fine-tuning* de políticas *downstream*: al ser un SFT sobre cadenas de episodios, sirve como punto de partida para ajustar a otras tareas o morfologías dentro del mismo contrato de datos.
- Detección de fallos y validación de seguridad: comparar las observaciones predichas con las reales en simulación permite identificar divergencias (colisiones, pérdida de agarre) antes de ejecutar en el robot.
- Investigación en modelos de mundo: la combinación de dos flujos, atención con *sink* y condicionamiento multi-cámara permite estudiar la estabilidad de rollouts largos y el equilibrio entre fidelidad visual y precisión de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta los hiperparámetros de inferencia (CFG de vídeo 6, CFG de acción 1, 10 pasos, *flow shifts* 5 y 1) y el origen de los pesos, sin métricas de éxito de tarea, FVD, PSNR, errores de posición del efector ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Peso de los pesos: 17,9 GB en fp32 consolidado; en bf16/fp16 se reduciría a aproximadamente 9-10 GB (estimación a partir del tamaño del repositorio, no verificada).
- VRAM estimada para inferencia: no disponible de forma oficial. Una estimación conservadora sitúa el mínimo en 24 GB para bf16 con ventanas cortas (L = 4) y en 40-80 GB para ventanas de 49 trozos con las tres vistas y la caché de prefijo activa, dado el coste de los latentes de vídeo y de la atención sobre el historial.
- GPU recomendadas: A100 80 GB y H100 80 GB para ventanas largas y experimentos de barrido; L40S 48 GB o RTX 6000 Ada 48 GB como opción de gama profesional; RTX 4090 24 GB solo para ventanas cortas y en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 24 GB con L reducido y bf16, aunque sin datos verificados de consumo real; en tarjetas de 16 GB o menos no se recomienda sin cuantización, que no está publicada.
- Opciones de despliegue: el autor indica `XPolicyLab SANA_WAM_TSC`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. La carga requiere el código de la receta (`config.yaml`) y el manifiesto `episode_chain_contract.json`.
- Latencia y throughput: no disponibles. La inferencia recurre a 10 pasos de muestreo por trozo de 32 acciones, lo que sitúa el coste computacional por trozo en el orden de decenas de evaluaciones del transformer de 5 B, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rbdj-tsc-ob6000-s40k` (este modelo) | ~5 B | 4-49 trozos de 32 acciones a 25 fps; 3 vistas 256x320 | Vídeo multi-vista y acciones EEF | No disponible | HuggingFace, 0 descargas |
| π0 (Physical Intelligence) | ~3,3 B (dato público aproximado) | Ventana de acciones corta, una vista | Acciones de robot | No comercial (aproximado, verificar) | Pesos públicos con acceso condicionado |
| NVIDIA GR00T N1 | ~2 B (dato público aproximado) | Ventana corta, entrada VLM + difusión | Acciones de robot | Comunidad NVIDIA (verificar) | Pesos públicos |
| NVIDIA Cosmos-Predict 2 | 2 B y 14 B (aproximado) | Ventana de vídeo corta | Solo vídeo de mundo, sin acciones | NVIDIA Open Model License (verificar) | Pesos públicos |

Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse antes de usarse en una decisión técnica; la comparación directa de rendimiento no es posible porque este checkpoint no publica métricas. La diferencia cualitativa principal es que este modelo integra en un único artefacto la generación de acciones y la simulación visual multi-cámara, mientras que las alternativas se orientan o bien a política pura (π0, GR00T N1) o bien a modelo de mundo sin acción (Cosmos-Predict 2).

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse ningún derecho de uso comercial. Es necesario contactar con el autor antes de cualquier despliegue en producción.
- Sesgos de dominio: el entrenamiento se limita a RoboDojo en simulación con el brazo ARX X5 y tres cámaras concretas; no hay evidencia de generalización a otras morfologías, entornos o configuraciones de cámara.
- Brecha sim2real: no se documenta ninguna evaluación en hardware físico, por lo que la transferencia a un robot real es una hipótesis no validada.
- Riesgo de deriva en rollouts largos: aunque el *sink* de atención de horizonte 7 busca estabilizar ventanas de hasta 49 trozos, la acumulación de error autoregresivo no está cuantificada.
- Ausencia total de benchmarks: no existen métricas de éxito, fidelidad visual ni precisión de acción que permitan comparar con alternativas.
- Formato de pesos potencialmente inseguro: los ficheros `.bin` y `.pth` son serializaciones pickle; conviene cargarlos en un entorno aislado y verificar `SHA256SUMS` antes de su uso.
- Idioma no declarado: se desconoce si los *prompts* de instrucción funcionan en castellano; el preentrenamiento y el SFT probablemente usan instrucciones en inglés.
- Madurez: 0 descargas y 0 interacciones en HuggingFace; es un artefacto de investigación sin revisión de la comunidad ni mantenimiento conocido.
- Requisitos de cómputo elevados para un modelo de 5 B en fp32 con ventanas largas, sin variantes cuantizadas publicadas que faciliten el despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/Yuyang-z/rbdj-tsc-ob6000-s40k
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
