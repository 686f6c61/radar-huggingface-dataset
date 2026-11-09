# yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WellCalibrated

## Resumen

Nemotron-3.5-Lightning-30B-A3B-W3-WellCalibrated es un checkpoint cuantizado a 3 bits mediante GPTQ del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4`, publicado por el usuario yemara en Hugging Face. El modelo base, desarrollado por NVIDIA y liberado en agosto de 2026, emplea una arquitectura híbrida de mezcla de expertos (MoE) con capas intercaladas Mamba-2, capas MoE y capas de atención selectivas, con 30 000 millones de parámetros totales y 3000 millones activos por token (de ahí el sufijo A3B).

El problema que aborda esta publicación es la reduccion de huella de memoria en inferencia: parte de un checkpoint NVFP4 y lo recompone como pesos de 3 bits calibrados sobre una mezcla equilibrada de seis dominios, con un repositorio de 17,3 GB. No es un modelo final de produccion, sino un punto de partida para el pipeline `wsp-ptq`, en el que un agente LLM repara los pesos editandolos directamente; la version reparada se publica aparte como `yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated`.

La relevancia actual es doble: por un lado, demuestra la viabilidad de servir un modelo MoE hibrido de 30B en un unico GPU tras dequantizar a BF16; por otro, cuantifica el coste de la cuantizacion agresiva a 3 bits frente al release original NVFP4, con caidas medibles en tareas de razonamiento y codigo que el autor documenta explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida MoE con capas Mamba-2 intercaladas, capas MoE y capas de atencion selectivas (familia Nemotron H) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | 262 144 tokens (262K) segun el modelo base |
| Tipos de cuantizacion | 3 bits GPTQ (checkpoint publicado); el modelo base se distribuye en NVFP4; dequantizable a BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Pesos cuantizados a 3 bits con script `dequantize.py` incluido para reconstruir un checkpoint BF16; no se especifica el formato de serializacion exacto |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de mezcla de expertos que intercala capas Mamba-2 (modelo de espacio de estados) con capas MoE y un subconjunto de capas de atencion. Esta combinacion busca reducir el coste computacional del mecanismo de atencion en contextos largos manteniendo la capacidad de recuperacion de informacion a traves de las capas de atencion selectivas. Con 30B parametros totales y solo 3B activos por token, el coste de inferencia por token se aproxima al de un modelo denso de 3B, mientras que la capacidad representacional se acerca a la de un modelo de 30B.

Sobre el entrenamiento del modelo base no se dispone de detalles en la informacion proporcionada: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El checkpoint que nos ocupa no reentrena el modelo, sino que aplica cuantizacion GPTQ a 3 bits calibrada sobre una mezcla equilibrada de seis dominios, lo que constituye una innovacion metodologica relevante: la calibracion multido minio busca preservar el comportamiento en tareas diversas (matematicas, codigo, conocimiento general, etc.) en lugar de optimizar para un unico tipo de prompt. El autor posiciona este checkpoint como entrada del pipeline `wsp-ptq`, donde un agente LLM edita directamente los pesos para reparar la degradacion introducida por la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento general, con resultados medidos en MMLU (67,2) y GPQA Diamond (59,6) en la version de 3 bits.
- Razonamiento matematico: GSM8K (91,6) y MATH-500 (80,8) en el checkpoint cuantizado.
- Generacion de codigo: LiveCodeBench v6 (39,2) en la version de 3 bits.
- Capacidad de contexto largo: el modelo base soporta 262K tokens, lo que habilita tareas de recuperacion y sintesis sobre documentos extensos.
- El modelo base se publica junto a metodos de decodificacion especulativa orientados a acelerar la generacion de texto (segun la model card de NVIDIA NIM).
- Soporte de tool calling, function calling y flujos de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: con 91,6 en GSM8K y 80,8 en MATH-500, el checkpoint es util para resolver problemas aritmeticos y algebraicos de nivel escolar y de competicion en entornos donde la huella de memoria es critica, aunque con una perdida de precision frente al release NVFP4 que conviene validar por dominio.
- Generacion de codigo en pipelines de CI: con 39,2 en LiveCodeBench v6, puede emplearse para autocompletado, generacion de tests o revision de parches, siempre que se acepte la degradacion respecto al modelo base (55,2) y se disponga de una fase de validacion con tests ejecutables.
- Analisis de documentos largos: el contexto de 262K tokens del modelo base permite procesar contratos, informes o bases de codigo completas en una sola pasada, aprovechando el bajo coste por token de la activacion de solo 3B parametros.
- Investigacion en cuantizacion: el checkpoint esta disenado explicitamente como punto de partida para el pipeline `wsp-ptq`, por lo que su uso principal es experimental: medir la degradacion por dominio, entrenar agentes de reparacion de pesos y comparar estrategias de calibracion.
- Despliegue en un unico GPU: tras dequantizar a BF16, el autor indica que se sirve con vLLM en una sola GPU, lo que lo hace adecuado para prototipos y entornos de investigacion con hardware limitado.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia de linea base (3 bits bien calibrado, antes de reparacion) frente a la version reparada WSP y frente al release NVFP4, permitiendo aislar la contribucion de cada etapa.
- Generacion de texto general en entornos con restricciones de VRAM: para tareas de resumen, redaccion o clasificacion donde la precision extrema no sea critica, la reduccion de huella a 17,3 GB en disco y la dequantizacion a BF16 facilitan el despliegue en GPUs de gama alta para consumo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Tests ejecutados una sola vez, con pesos de 3 bits dequantizados a BF16 y servidos con vLLM en un unico GPU.

| Checkpoint | GSM8K | MATH-500 | LiveCodeBench v6 | GPQA Diamond | MMLU | WikiText-2 PPL |
|---|---|---|---|---|---|---|
| NVFP4 release (base) | 95,0 | 88,8 | 55,2 | 71,1 | 77,1 | 8,08 |
| Well-calibrated 3-bit (este repo) | 91,6 | 80,8 | 39,2 | 59,6 | 67,2 | 11,15 |

La tabla muestra una degradacion consistente: la mayor caida relativa se produce en LiveCodeBench v6 (de 55,2 a 39,2, aproximadamente un 29 % menos) y en GPQA Diamond (de 71,1 a 59,6, aproximadamente un 16 % menos), mientras que GSM8K resiste mejor (de 95,0 a 91,6, aproximadamente un 3,6 % menos). La perplejidad en WikiText-2 sube de 8,08 a 11,15.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,3 GB en disco con pesos de 3 bits; tras dequantizar a BF16, un modelo de 30B parametros requiere aproximadamente 60 GB de VRAM solo para pesos, mas overhead de KV cache y activaciones. El autor indica que se sirve con vLLM en un unico GPU, lo que apunta a GPUs de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o similares para el checkpoint dequantizado a BF16. Para servir directamente los pesos de 3 bits sin dequantizar a BF16 se requeriria un runtime compatible con GPTQ de 3 bits, no documentado en la informacion disponible.
- Cabe en GPU de consumo: no disponible de forma fiable; con 30B parametros en BF16 no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB). Solo seria viable con tecnicas adicionales de cuantizacion en tiempo de ejecucion no descritas en la informacion proporcionada.
- Opciones de despliegue: vLLM (documentado por el autor tras ejecutar `dequantize.py`); llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponible. La arquitectura MoE con 3B parametros activos sugiere un throughput por token bajo en comparacion con modelos densos de 30B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-W3-WellCalibrated (este repo) | 30B / 3B | 262K (heredado del base) | OpenMDW-1.1 | 3 bits GPTQ, dequantizable a BF16 | Calibrado en seis dominios; pensado como base para reparacion con wsp-ptq |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (base) | 30B / 3B | 262K | OpenMDW-1.1 | NVFP4 | Release oficial de NVIDIA; mejor rendimiento en todos los benchmarks publicados |
| Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated (version reparada) | 30B / 3B | 262K (heredado del base) | OpenMDW-1.1 | 3 bits tras reparacion con agente LLM | Resultado del pipeline wsp-ptq; benchmarks no disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Degradacion medible frente al modelo base: perdidas de hasta un 29 % relativo en LiveCodeBench v6 y un 16 % en GPQA Diamond, con aumento de perplejidad de 8,08 a 11,15 en WikiText-2. No es adecuado para tareas de codigo o razonamiento cientifico de alta exigencia sin validacion adicional.
- El checkpoint es un punto de partida experimental, no un modelo final: el autor lo describe como entrada del pipeline `wsp-ptq` y publica una version reparada aparte. Usarlo en produccion sin la fase de reparacion puede no ser representativo del mejor rendimiento alcanzable.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; la cuantizacion agresiva puede incrementar la generacion de contenido incorrecto, especialmente en dominios con caida de benchmark acusada.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingue ni la cobertura de idiomas distintos del ingles.
- Restricciones de licencia: OpenMDW-1.1, la misma del modelo fuente; el archivo `LICENSE` del repositorio es el del modelo original con sus avisos. Conviene revisar los terminos de OpenMDW-1.1 antes de uso comercial, ya que la licencia se etiqueta como "other" en Hugging Face.
- Formato de pesos no estandar: requiere ejecutar `dequantize.py` para reconstruir un checkpoint BF16 antes de servir con vLLM; no es directamente compatible con runtimes que esperan safetensors o GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.
- Sin datos publicados sobre sesgos, tool calling, agentes o modo thinking: no se puede confirmar su comportamiento en esos escenarios.
- La fecha de creacion del repositorio (2026-11-08) y la del modelo base (agosto de 2026) implican que el ecosistema de herramientas (vLLM, llama.cpp) puede no tener soporte maduro para este checkpoint concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WellCalibrated
- Version reparada: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Pipeline wsp-ptq: https://github.com/yahya010/wsp-ptq
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Benchmarks y precios en llm-stats: https://llm-stats.com/models/nemotron-3.5-lightning-30b-a3b
