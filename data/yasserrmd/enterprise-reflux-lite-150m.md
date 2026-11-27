# yasserrmd/enterprise-reflux-lite-150m

## Resumen

Enterprise Reflux Lite 150M es un modelo de decisión estructurada desarrollado por Mohamed Yasser (usuario `yasserrmd` en Hugging Face) como parte de la serie de investigación Enterprise Reflux Decision Intelligence. Se trata de un encoder bidireccional ModernBERT/Ettin afinado a partir del checkpoint `typestrict/TS-Ettin-150M` con 149.614.978 parámetros, cuyo propósito no es generar texto libre, sino evaluar un estado estructurado junto con un conjunto de acciones candidatas y clasificar la mejor opción, incluyendo la posibilidad de abstenerse mediante la etiqueta `NO_ACTION`.

El modelo se concibe como una capa "System-1" dentro de arquitecturas de IA agéntica y empresarial: una pieza rápida y ligera que propone decisiones (selección de acción candidata, clasificación de ejecución, abstención) mientras que la autorización determinista, la ejecución de transacciones y la escalada a revisión humana quedan fuera del modelo. Esta separación arquitectónica es el eje del proyecto: el modelo propone, pero no tiene autoridad para ejecutar ni modificar sistemas externos.

Su relevancia actual radica en la eficiencia: está orientado a CPU, con latencias medidas de 368,97 ms (P50) en CPU nativa y 54,33 ms en GPU nativa, y se distribuye en safetensors y ONNX FP32 con licencia Apache 2.0. Es un experimento de investigación (experimento 04 de la serie), no un modelo validado en producción, y su tarjeta advierte explícitamente de que los benchmarks son conjuntos de desafío históricos controlados, no evaluaciones independientes de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT / Ettin, encoder bidireccional con scoring nativo de candidatos tipo OPT-token |
| Parametros totales | 149.614.978 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 validado; exportación INT8 descartada por falta de paridad (85,71% de acuerdo de decisión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; ONNX FP32 (`onnx/model_fp32.onnx`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `typestrict/TS-Ettin-150M` (revisión fijada `17da873b49fbfb6af57f135e6bdb4afc7f2444c8`), un encoder bidireccional de la familia ModernBERT/Ettin. Sobre esa base se añade un mecanismo de scoring de candidatos mediante posiciones tipo OPT-token, además de embeddings de tipo de pregunta, y se afina el encoder completo junto con el scorer de candidatos. La cabeza de confianza preentrenada se mantiene congelada durante el ajuste.

El entrenamiento emplea 91.636 ejemplos durante 2 épocas, con semilla 42, AdamW8bit, autocast BF16, tasa de aprendizaje 8e-6 y batch efectivo de 64. Los objetivos combinan el ranking estructurado de candidatos y la clasificación de ejecución cuando existen etiquetas de ejecución (las desconocidas se excluyen de esa pérdida). El corpus de investigación Enterprise Reflux Decision-100K+ mezcla escenarios de decisión empresarial estructurados, ejemplos condicionados por políticas, pares contrafactuales y ejemplos derivados de intenciones públicas; el total asciende a 104.680 registros repartidos en entrenamiento (91.636), validación (6.086), calibración (2.841), test estándar reservado (3.017), Extreme-200 (200), Hard-400 (400) y Mixed-500 (500). La selección del mejor checkpoint se hizo por rendimiento en validación, no por resultados finales de test.

## Capacidades

- Selección y ranking de acciones candidatas sobre un estado estructurado, devolviendo una ordenación de candidatos y una puntuación de confianza.
- Abstención explícita mediante `NO_ACTION`, con métricas reportadas de precisión y F1 del 100,00% en el test estándar.
- Clasificación de ejecución (etiquetas ACT/ESCALATE) cuando el escenario incluye etiquetas de ejecución.
- Razonamiento contrafactual: capacidad de distinguir pares contrafactuales (96,89% de precisión reportada).
- Calibración de la confianza de elección (error de calibración esperado de 0,35%).
- Inferencia orientada a CPU, con backend nativo y exportación ONNX FP32 validada al 100,00% de acuerdo de decisión frente al modelo PyTorch nativo.
- No es un modelo generativo de texto libre: no produce respuestas abiertas ni conversación multi-turno.
- Soporte de tool calling, agentes autónomos, visión, audio o modo "thinking": no disponible / no contemplado en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines agénticos: dado un estado estructurado y un conjunto cerrado de acciones posibles, el modelo puntúa y ordena las candidatas para que un componente determinista posterior autorice y ejecute; su latencia de 368,97 ms en CPU permite integrarlo en bucles de agente sin GPU.
- Triaje con abstención: en flujos donde la acción incorrecta es costosa, la etiqueta `NO_ACTION` y la calibración de confianza permiten derivar casos ambiguos a revisión humana en lugar de forzar una decisión.
- Clasificación de ejecución y escalado: uso de las etiquetas ACT/ESCALATE para decidir si una acción puede procesarse automáticamente o requiere escalada, siempre con autorización externa al modelo.
- Evaluación de políticas empresariales: los ejemplos condicionados por políticas del corpus permiten usar el modelo para comprobar si una acción candidata es coherente con la política aplicable en un escenario dado.
- Filtrado previo de candidatos en sistemas de recomendación de acciones: al devolver Top-1/Top-2/Top-3, puede reducir el espacio de opciones antes de un modelo mayor o de una validación humana (Top-3 del 99,73% en el test estándar).
- Despliegue en entornos sin GPU: la exportación ONNX FP32 y el backend nativo en CPU permiten ejecutarlo en servidores modestos o en el borde, con la salvedad de que la latencia medida excluye tokenización y procesamiento de aplicación.
- Investigación sobre separación System-1/System-2: sirve como componente ligero de decisión en arquitecturas que reservan el razonamiento costoso a un modelo mayor.

## Benchmarks y rendimiento

Resultados de evaluación reportados por el autor (conjuntos de desafío históricos controlados, no benchmarks independientes):

| Suite de evaluacion | Muestras | Base Top-1 | Fine-tuned Top-1 | Delta |
|---|---:|---:|---:|---:|
| Test estándar reservado | 3.017 | 64,53% | 97,48% | +32,95 pp |
| Extreme-200 | 200 | 45,50% | 60,50% | +15,00 pp |
| Hard-400 | 400 | 41,00% | 76,75% | +35,75 pp |
| Mixed-500 | 500 | 55,20% | 74,20% | +19,00 pp |
| Conjunto congelado combinado | 1.100 | 48,27% | 72,64% | +24,36 pp |

Detalle del test estándar:

| Metrica | Resultado fine-tuned |
|---|---:|
| Top-1 accuracy | 97,48% |
| Top-2 accuracy | 99,54% |
| Top-3 accuracy | 99,73% |
| Concrete-action accuracy | 97,07% |
| NO_ACTION accuracy | 100,00% |
| NO_ACTION F1 | 100,00% |
| ACT/ESCALATE macro F1 | 100,00% |
| Counterfactual pair accuracy | 96,89% |
| Choice calibration error (ECE) | 0,35% |
| Execution gate coverage | 0,00% |

Latencia de inferencia medida (100 casos, 4 hilos de CPU donde aplica, excluye tokenización y procesamiento de aplicación):

| Backend | P50 | P95 | Estado |
|---|---:|---:|---|
| CPU / nativo | 368,97 ms | 557,58 ms | Medido |
| GPU / nativo | 54,33 ms | 55,90 ms | Medido |
| ONNX FP32 / CPU | 424,12 ms | 701,70 ms | Medido |

Paridad de la exportación ONNX FP32: 100,00% de acuerdo de decisión sobre 56 preguntas de validación, con error máximo de probabilidad de 6,258487701416016e-06. La exportación INT8 se descartó por no alcanzar la paridad exigida (85,71% de acuerdo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 149,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,6 GB y en BF16/FP16 unos 0,3 GB, a lo que hay que sumar el estado de activaciones y el vocabulario.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta mediciones en GPU nativa (P50 de 54,33 ms) sin detallar el hardware empleado.
- Cabe en GPU de consumo: por tamaño (149,6 M de parámetros), es viable en cualquier GPU de consumo actual, aunque no hay confirmación explícita del autor ni lista de modelos probados.
- Opciones de despliegue: runtime nativo específico del modelo (no un pipeline genérico de `AutoModel` de generación de texto) y ONNX Runtime cargando explícitamente el grafo FP32 liberado; el cargador estándar `DinahONNX` espera un nombre de fichero INT8, por lo que hay que cargar el FP32 de forma explícita.
- Latencia y throughput: P50 de 368,97 ms y P95 de 557,58 ms en CPU nativa; 54,33 ms y 55,90 ms en GPU nativa; 424,12 ms y 701,70 ms en ONNX FP32 sobre CPU. No se reporta throughput (peticiones por segundo).
- El repositorio ocupa 1,2 GB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión estructurada de ~150 M orientados a CPU). La comparación más directa disponible es con su propio checkpoint base:

| Modelo | Parametros | Contexto | Top-1 test estandar | Top-1 conjunto congelado | Licencia |
|---|---:|---|---:|---:|---|
| Enterprise Reflux Lite 150M | 149,6 M | no disponible | 97,48% | 72,64% | Apache 2.0 |
| TS-Ettin-150M (base) | 150 M (aprox.) | no disponible | 64,53% | 48,27% | Apache 2.0 (upstream) |

Comparativa con alternativas de terceros: no disponible.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor lo etiqueta como "Research status: Experimental"; no hay validación en producción ni resultados de terceros independientes.
- Los conjuntos de evaluación (Extreme-200, Hard-400, Mixed-500, test estándar) son desafíos históricos controlados del propio proyecto, no benchmarks públicos ni resultados reales verificados.
- El rendimiento cae notablemente fuera del test estándar: 60,50% Top-1 en Extreme-200 y 72,64% en el conjunto congelado combinado, frente al 97,48% del test estándar.
- La cobertura de la compuerta de ejecución es del 0,00%, por lo que la clasificación de ejecución no está cubierta en la evaluación reportada.
- No es un modelo generativo: no admite conversación libre ni generación de texto; usarlo mediante un pipeline genérico de generación de texto es un error de interfaz según el autor.
- La exportación INT8 no alcanza paridad (85,71% de acuerdo) y se excluye intencionalmente; solo el FP32 está validado.
- Las latencias excluyen tokenización y procesamiento de aplicación y no deben interpretarse como latencia de servicio de extremo a extremo.
- El modelo propone decisiones pero no tiene autoridad para ejecutar transacciones ni modificar sistemas externos; requiere autorización determinista y revisión humana externas.
- No se incluyen en la release los registros de entrenamiento originales, ejemplos crudos de evaluación, predicciones por registro, checkpoints de recuperación ni cachés de tokenización, lo que limita la reproducibilidad.
- Idiomas soportados: no disponible; no hay información sobre cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada (al no ser generativo, el riesgo relevante es de clasificación errónea, no de alucinación textual).
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse la atribución de fuentes y los términos del dataset en cualquier redistribución separada del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/enterprise-reflux-lite-150m
- Perfil del autor: https://huggingface.co/yasserrmd
- Checkpoint base: https://huggingface.co/typestrict/TS-Ettin-150M
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
