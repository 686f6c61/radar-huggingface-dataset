# Yuyang-z/rbdj-tsc-noweight-s15k

## Resumen

`rbdj-tsc-noweight-s15k` es un modelo de mundo (world model) de vídeo y acción para robótica manipulativa, publicado por el usuario Yuyang-z en HuggingFace. No es un modelo de lenguaje: es un checkpoint de la familia SANA-RWM que predice observaciones visuales multi-vista y secuencias de acciones de efector final (EEF) para el brazo ARX X5 dentro del simulador RoboDojo. Concretamente, se trata del ajuste fino supervisado (SFT) del modelo de mundo de dos flujos con bloques de observación `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36`, en su epoch 18, step 15.000, con pesos en crudo (sin cuantizar).

El checkpoint parte de un preentrenamiento (`SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_ws256`, epoch 2 step 6.000) y de una receta de SFT en cadena de episodios (`SANA_RoboDojo_EpisodeChain_SFT_obsblock6000_noweight_kef4n`). Trabaja con ventanas de episodio completas desde el primer fotograma, con secuencias de 4 a 49 chunks de 32 acciones absolutas a 25 fps y tres vistas de 256×320 píxeles codificadas con latentes LTX-2.3.

Su relevancia es acotada pero específica: los modelos de mundo de este tipo se usan para generar rollouts imaginados que alimentan el entrenamiento y la evaluación de políticas robóticas sin burn-in de simulador, y este checkpoint documenta de forma inusualmente detallada la receta (contrato de datos, normalización con hash, configuración de inferencia). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas, lo que limita su uso inmediato en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión/flow matching de dos flujos (vídeo y acción) con bloques de observación (obs-block), sub-atención y acondicionamiento por cámara; variante `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewTwoStream_5B_P1_D36` (profundidad 36, etapa P1) |
| Parámetros totales | ~5·10⁹ según el identificador del checkpoint; el fichero consolidado en fp32 ocupa 17,9 GB, lo que equivale a ~4,5·10⁹ parámetros (estimación a partir del tamaño, no confirmada por el autor) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Ventanas de episodio de L = 4 a 49 chunks × 32 acciones = 128 a 1.568 pasos de acción a 25 fps; horizonte de sink softmax de 7 |
| Tipos de cuantización | No disponible (el autor publica únicamente pesos fp32 consolidados) |
| Idiomas soportados | No aplica como modelo generativo de texto; las instrucciones se codifican con el codificador de texto Qwen integrado (prompts de token-group del preentrenamiento, con instruction dropout 0,1) |
| Licencia | No disponible |
| Formato de pesos | `model/pytorch_model_fsdp.bin` (PyTorch, fp32 consolidado), `metadata.pth`, `config.yaml`, `episode_chain_contract.json`, `RUN_ID.json`, `SHA256SUMS`, directorio `normalization/` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mundo de dos flujos con atención subdividida y formulación self-flow (flow matching). Un flujo genera los latentes de vídeo de las tres cámaras y otro genera las acciones; ambos se acoplan mediante bloques de observación que intercambian información entre las representaciones visuales y las de acción. El modelo está condicionado por cámara y por instrucción textual, codificada con un backbone tipo Qwen (`QwenNext` en el identificador). El identificador indica 5B parámetros y profundidad 36, y la resolución de trabajo es 256×320 con tres vistas a 25 fps, usando latentes del VAE LTX-2.3. La generación se hace por flow matching con 10 pasos de muestreo y shifts distintos por flujo (5 para vídeo, 1 para acción), con CFG de 6 en vídeo y 1 en acción.

El entrenamiento se organiza en dos etapas documentadas en la model card. Primero, un preentrenamiento vanilla a 256 px con mezcla absoluta, captioning v3, dos flujos y obs-block, partiendo del step 3.500 con ventana de 256; el checkpoint de partida es el epoch 2, step 6.000. Después, un SFT sobre la cadena de episodios de RoboDojo: se usan ventanas que cubren episodios completos desde su primer fotograma, con L = 4 a 49 chunks de 32 acciones EEF absolutas a 25 fps, tres vistas de 256×320 y latentes LTX-2.3, aplicando la normalización de la receta de la cadena y los prompts de token-group del preentrenamiento con un 10 % de instruction dropout. El checkpoint publicado corresponde al epoch 18, step 15.000, con pesos en crudo. La innovación destacable es el mecanismo de prefill de prefijo limpio (`prefix_cache` de sana-rwm), que permite generar únicamente el último chunk de la ventana de episodio reutilizando el contexto ya observado, y el uso del contrato de datos `episode_chain_contract.json` para garantizar la coherencia del almacén de ventanas.

## Capacidades

- Predicción de vídeo multi-vista: genera fotogramas futuros para tres cámaras simultáneas a resolución 256×320, condicionados por cámara y por instrucción.
- Predicción de acciones: emite chunks de 32 acciones absolutas de efector final (EEF) a 25 fps, alineadas temporalmente con la predicción visual.
- Rollout de horizonte largo: admite ventanas de episodio de hasta 49 chunks (1.568 pasos de acción), con contexto inicial prefillado desde observaciones limpias.
- Modelado conjunto vídeo-acción: al compartir representación entre ambos flujos, sirve como entorno imaginado para evaluar políticas.
- Muestreo por flow matching configurable: 10 pasos, shifts 5/1 y CFG diferenciado por flujo (6 en vídeo, 1 en acción).
- Acondicionamiento por instrucción: codificador de texto Qwen con prompts de token-group; el entrenamiento aplicó instruction dropout del 0,1, por lo que el modelo funciona también sin instrucción explícita.
- No soporta tool calling, function calling, agentes basados en texto, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje conversacional.

## Casos de uso

- Generación de datos sintéticos para robótica: el modelo produce pares observación-acción coherentes en el simulador RoboDojo para el brazo ARX X5, lo que permite aumentar el conjunto de entrenamiento de una política sin ejecutar el simulador físico paso a paso.
- Evaluación de políticas en imaginación: dada una política candidata, se pueden generar rollouts de hasta 1.568 pasos y medir la desviación respecto a las acciones propuestas para estimar el éxito antes de desplegar en hardware.
- Entrenamiento de políticas por modelo de mundo (model-based RL): el rollout imaginado y su recompensa derivada de la predicción visual alimentan el ajuste de la política con un coste menor que el muestreo directo del simulador.
- Prellenado interactivo con `prefix_cache`: en bucles de control donde el robot ya ha ejecutado parte del episodio, se prellena el prefijo limpio y solo se genera el último chunk, reduciendo el coste por paso de decisión.
- Supervisión multi-cámara: al generar tres vistas simultáneas condicionadas por cámara, permite detectar discrepancias entre vistas como señal de anomalía o de oclusión en el puesto de trabajo.
- Análisis de sensibilidad a la instrucción: con instruction dropout del 0,1 durante el entrenamiento, se pueden comparar rollouts con y sin prompt para estudiar cuánto condiciona el lenguaje la trayectoria generada.
- Replicación de receta: el repositorio incluye `config.yaml`, `episode_chain_contract.json`, `normalization/` con hash y `SHA256SUMS`, lo que permite reconstruir el pipeline de entrenamiento e inferencia en otro entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la configuración de inferencia (CFG de vídeo 6, CFG de acción 1, 10 pasos de muestreo, shifts 5/1) y los checkpoints de partida, sin métricas de éxito, error de trayectoria ni comparación cuantitativa con otras políticas o modelos de mundo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos consolidados en fp32 ocupan 17,9 GB; a ello hay que sumar latentes de tres vistas a 256×320, el estado del flujo de acciones para ventanas de hasta 1.568 pasos y el caché de prefijo. Un cálculo conservador sitúa el mínimo práctico en 24-32 GB de VRAM; no hay cifras oficiales publicadas.
- GPU recomendadas: A100 80 GB y H100 80 GB para ventanas largas (L próximo a 49); A100 40 GB o L40S 48 GB para ventanas cortas.
- GPU de consumo: una RTX 4090 de 24 GB queda al límite con fp32 y probablemente requiera conversión a bf16 o fp16 (no documentada por el autor) y ventanas reducidas; no hay soporte oficial declarado para hardware de consumo.
- Opciones de despliegue: el autor indica XPolicyLab con el perfil `SANA_WAM_TSC`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de mundo vídeo-acción con VAE y flow matching.
- Latencia y throughput: no disponibles. El coste por chunk depende de los 10 pasos de muestreo, del CFG de vídeo y del uso de `prefix_cache`; el autor no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rbdj-tsc-noweight-s15k` (este) | ~5·10⁹ (identificador) | L = 4-49 chunks × 32 acciones (128-1.568 pasos), 3 vistas 256×320 | No disponible | Pesos fp32 en HuggingFace, 0 descargas |
| `SANA_RoboDojo_EpisodeChain_SFT_obsblock6000_noweight_kef4n` (checkpoint padre de la cadena) | No disponible | No disponible (misma receta de cadena de episodios) | No disponible | Referenciado en la model card; no se enlaza repositorio |
| `SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_twostream_obsblock_from_ts3500_ws256` (epoch 2, step 6.000) | No disponible | Ventana de 256 (ws256), resolución 256 px | No disponible | Ruta local indicada en la model card (`output/pretrained_models/...`); no se enlaza repositorio |

No se dispone de datos verificados de otros modelos de mundo comparables (por ejemplo, familias tipo Cosmos o Genie) en la información proporcionada, por lo que no se incluye comparación numérica con ellos.

## Limitaciones y advertencias

- Modelo de mundo específico de un entorno: entrenado para RoboDojo sim con el brazo ARX X5 y tres vistas de 256×320 a 25 fps; no es transferible sin más a otros robots, cámaras o resoluciones.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir rollouts plausibles pero físicamente incorrectos; no debe usarse como sustituto de la simulación física para validación de seguridad.
- Sesgos de datos: el modelo hereda la distribución del simulador y de la receta de episodios de RoboDojo; objetos, iluminación y tareas fuera de esa distribución degradarán la predicción sin aviso.
- Limitación de contexto: la ventana máxima documentada es de 49 chunks (1.568 pasos de acción); los episodios más largos requieren truncado o reinicio del contexto.
- Repositorio sin señales de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas; no hay evidencia de que el checkpoint se haya evaluado fuera del entorno del autor.
- Pesos en crudo fp32: no hay versiones cuantizadas ni formato GGUF, lo que encarece el despliegue y complica la integración en infraestructuras con GPUs de menos de 32 GB.
- Dependencia de código externo: la inferencia requiere el perfil `SANA_WAM_TSC` de XPolicyLab y el mecanismo `prefix_cache` de sana-rwm, que no forman parte del repositorio de pesos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Yuyang-z/rbdj-tsc-noweight-s15k
- Perfil del autor: https://huggingface.co/Yuyang-z
- Repositorio de inferencia indicado en la model card: XPolicyLab, perfil `SANA_WAM_TSC` (no se proporciona URL)
- No se han encontrado en la información disponible enlaces a papers, blogs, demos ni repositorios adicionales.
