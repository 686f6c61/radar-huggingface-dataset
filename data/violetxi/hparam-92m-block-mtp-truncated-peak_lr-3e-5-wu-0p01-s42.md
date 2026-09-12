# violetxi/hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p01-s42

## Resumen

El modelo `hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p01-s42` es un modelo de lenguaje de 92.138.496 parámetros desarrollado por el usuario de HuggingFace violetxi (Violet Xiang), concebido específicamente para la generación de notación de ajedrez. Forma parte de un barrido de hiperparámetros (el autor publica 134 modelos en su perfil) y esta ficha corresponde al punto de control del paso 185.000 de la condición `92m-blktrunc-lr3e5-wu01-s42`. El modelo emplea una arquitectura propietaria etiquetada como `looped_block_mtp`, basada en transformadores con bloques recurrentes y predicción multi-token (MTP) entrenada con truncated BPTT.

A diferencia de un modelo autorregresivo convencional, este sistema puntúa tres posiciones de consulta fijas y causalmente ordenadas en cada pasada recurrente, y `generate()` confirma el bloque completo de tres tokens antes de pasar al siguiente bloque. El contexto es de 1.024 tokens lógicos, incluyendo el bloque de consulta, y el token máscara (ID 81) no puede generarse. No soporta caché KV ni búsqueda por haces.

Su relevancia es fundamentalmente de investigación: explora la predicción por bloques y el truncamiento del grafo de retropropagación como alternativas al siguiente-token-prediction estándar, tomando el ajedrez como dominio de prueba controlado. No es un modelo de propósito general ni está pensado para producción multilingüe, sino como artefacto experimental dentro de una comparativa de hiperparámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `looped_block_mtp` (transformador con bloques recurrentes y predicción multi-token, truncated BPTT) |
| Parametros totales | 92.138.496 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens logicos (incluye el bloque de consulta de 3 tokens) |
| Tipos de cuantizacion | no disponible (los safetensors preservan los tensores nativos; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible (dominio limitado a notacion de ajedrez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (mas config, tokenizer y codigo custom; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura `looped_block_mtp` organiza la inferencia en pasadas recurrentes que puntúan tres slots de consulta fijos y causalmente ordenados. `model.block_logits(input_ids)` devuelve un tensor `[batch, 1, 3, vocab]` con la predicción del siguiente bloque de tres tokens. El entrenamiento utiliza BPTT truncado, tal y como indica el nombre de la condición (`blktrunc`), lo que limita la profundidad del grafo de retropropagación a través de las recurrencias. El checkpoint exportado corresponde al paso 185.000 y se identifica mediante la revisión `step-185000`; cada checkpoint del barrido tiene su propia rama.

La función de pérdida registrada es una pérdida de bloque densa y no solapada: `model(input_ids, labels=input_ids)` hace que `logits[:, t]` puntúe el token `t+1`, de modo que cada grupo de tres tokens ve únicamente el prefijo anterior a ese grupo. El autor especifica explícitamente que esto no es un entrenamiento NTP estándar con teacher forcing. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El archivo `training_summary.json` vincula la exportación con el checksum nativo y las versiones de código fuente, y las licencias del código del núcleo adaptado se incluyen junto a él. Los valores de safetensors preservan exactamente los tensores nativos; el estado del optimizador y de recuperación de RNG permanece en el archivo nativo y no es necesario para inferencia con HuggingFace.

## Capacidades

- Generación de notación de ajedrez en formato algebraico (por ejemplo, `Pe2e4 Pe7e5 Ng1f3`), que es el caso de uso codificado en el tokenizer y reflejado en el ejemplo de la model card.
- Predicción por bloques de tres tokens en lugar de token a token, con confirmación del bloque completo antes de la siguiente pasada recurrente.
- Muestreo estocástico (`do_sample=True` con temperatura, `top_k`, `top_p`) y generación voraz.
- Soporte de `padding` y `num_return_sequences`.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso genérico.
- No se documenta capacidad multilingüe; el tag de dominio es exclusivamente `chess`.
- No dispone de modo thinking, visión ni audio.
- No soporta caché KV ni búsqueda por haces (`beam search`), lo que condiciona cualquier integración en tiempo real.

## Casos de uso

- Generación de continuaciones de partidas de ajedrez: dado un prefijo en notación algebraica, el modelo produce los siguientes bloques de tres movimientos. Es adecuado porque el tokenizer y el entrenamiento están centrados en ese formato.
- Investigación sobre predicción multi-token (MTP): permite comparar la pérdida de bloque frente a NTP convencional dentro de un barrido de hiperparámetros documentado (134 variantes en el perfil del autor).
- Estudio de BPTT truncado en arquitecturas recurrentes: el checkpoint `blktrunc` sirve como punto de comparación frente a la variante `sequential-mtp-full` del mismo autor.
- Generación de datasets sintéticos de notación de ajedrez para preentrenamiento o aumento de datos, siempre que se aplique después un validador de legalidad de movimientos.
- Reconstrucción y análisis de aperturas: el modelo puede emplearse para completar secuencias de apertura y estudiar distribuciones de movimientos, dado su contexto de 1.024 tokens.
- Docencia y demostraciones de arquitecturas no convencionales: al ser un modelo de 92M parámetros, se puede cargar y ejecutar en entornos modestos para ilustrar predicción por bloques sin caché KV.
- Componente de evaluación en pipelines de investigación que midan la coherencia de secuencias de ajedrez generadas por modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que "Benchmark inference is not performed by publication" y que la selección de la condición se rige por las reglas de validación y colapso del barrido, no por métricas de benchmark publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los 92,1 M de parámetros ocupan aproximadamente 184 MB en bfloat16 y unos 368 MB en float32, sin contar activaciones. Cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente. El ejemplo oficial funciona con `cuda` si está disponible y cae a CPU en caso contrario.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales e incluso en GPUs integradas, dado el reducido tamaño del modelo.
- Almacenamiento: el repositorio ocupa 50,1 GB, muy por encima del tamaño de los pesos, porque el archivo nativo incluye estado del optimizador y de recuperación de RNG. Para inferencia solo se necesita una fracción de ese espacio.
- Opciones de despliegue: se requiere la librería `transformers` con `trust_remote_code=True` y las dependencias de `requirements.txt`. No se documenta soporte para runtimes estándar como vLLM, llama.cpp, Ollama o TGI, que previsiblemente no reconocen la implementación custom `looped_block_mtp`.
- Latencia y throughput estimados: no disponible. La ausencia de caché KV implica recalcular el prefijo en cada bloque, lo que penaliza la generación de secuencias largas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas directas. Dentro del propio barrido del autor se identifican variantes comparables por nombre, pero sus métricas no están publicadas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p01-s42` | 92,1 M | 1.024 tokens logicos | no disponible | HuggingFace (revision `step-185000`) | Variante principal de esta ficha, BPTT truncado |
| `hparam-92m-block-mtp-truncated-peak_lr-1e-4-wu-0p05-s42` | no disponible | no disponible | no disponible | HuggingFace | Misma familia, distinto `peak_lr` y `warmup` |
| `hparam-92m-sequential-mtp-full-peak_lr-3e-5-wu-...` | no disponible | no disponible | no disponible | HuggingFace | Variante secuencial sin truncado del grafo |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Dominio restringido: el modelo esta entrenado y etiquetado para ajedrez. Fuera de ese dominio, la calidad es impredecible y no esta documentada.
- Riesgo de alucinacion elevado en el sentido funcional: puede generar movimientos ilegales o secuencias incoherentes, ya que no se documenta ningun validador de legalidad integrado.
- Contexto limitado a 1.024 tokens logicos, lo que restringe la longitud de las partidas o secuencias que se pueden modelar de una sola pasada.
- Sin cache KV: cada bloque recurrente exige recalcular el prefijo, con el consiguiente coste computacional en generaciones largas.
- Sin busqueda por haces: solo se admite muestreo y generacion voraz.
- El token mascara (ID 81) no puede generarse; cualquier integracion debe tenerlo en cuenta al filtrar salidas.
- La perdida de entrenamiento no es NTP estandar con teacher forcing, por lo que las metricas de perplejidad convencionales no son directamente comparables con modelos autorregresivos clasicos.
- Dependencia de codigo custom: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar dicho codigo antes de usarlo en entornos sensibles.
- Idiomas soportados no declarados; no hay evidencia de capacidades multilingues.
- El repositorio de 50,1 GB incluye estado de optimizador y RNG innecesario para inferencia, lo que complica su descarga y almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/hparam-92m-block-mtp-truncated-peak_lr-3e-5-wu-0p01-s42
- Perfil del autor (134 modelos publicados): https://huggingface.co/violetxi
