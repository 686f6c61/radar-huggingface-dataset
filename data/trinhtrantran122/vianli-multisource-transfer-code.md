# trinhtrantran122/vianli-multisource-transfer-code

## Resumen

Este modelo es un checkpoint de investigacion del experimento EXP-001, un estudio de viabilidad sobre transferencia de aprendizaje entre tareas de inferencia de lenguaje natural (NLI) en vietnamita. Desarrollado por trinhtrantran122, el experimento evalua si un checkpoint intermedio de ViNLI (Vietnamese Natural Language Inference) correctamente mapeado mejora el rendimiento de Flat CafeBERT en ViANLI (Vietnamese Adversarial NLI). El modelo es un clasificador plano de 3 clases (Entailment/Contradiction/Neutral) basado en CafeBERT, fine-tuneado sobre 8.010 filas del conjunto de entrenamiento de ViANLI con semilla 42.

Se trata de un artefacto de investigacion, no de un modelo de proposito general. El experimento incluye una intervencion cientifica especifica: revision del checkpoint de ViNLI, intercambio de las filas 1 y 2 del clasificador (mapeo E/N/C obsoleto a E/C/N canonico), verificacion de metricas, y fine-tuning solo sobre datos de entrenamiento de ViANLI sin fugas. El conjunto de test de ViANLI permanece bloqueado, y no se realizan evaluaciones sobre el test objetivo en este experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flat CafeBERT (BERT para vietnamita, clasificador plano de 3 clases E/C/N) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en CafeBERT, un modelo BERT preentrenado para vietnamita, configurado como clasificador plano de 3 clases (Entailment, Contradiction, Neutral) sin cabezas jerarquicas ni mecanismos de inferencia hard/soft. El entrenamiento sigue un protocolo de transferencia de multiples fuentes: primero se parte de un checkpoint de ViNLI (18.282 filas de entrenamiento) con correccion del mapeo de clases, y posteriormente se fine-tunea sobre el conjunto de entrenamiento de ViANLI depurado (8.010 filas). No se emplea replay, entrenamiento con ViMedNLI, jerarquias, MoE, ni barridos de hiperparametros. La seleccion del checkpoint final se realiza exclusivamente mediante la Macro-F1 del conjunto de desarrollo de ViANLI.

El protocolo incluye una auditoria de multiples fuentes con verificacion de integridad, pruebas unitarias y validacion de notebooks. Los datos de ViMedNLI se preparan como diagnostico (11.217 filas de entrenamiento, con 15 filas conflictivas eliminadas), pero no se utilizan para entrenamiento en este experimento.

## Capacidades

- Clasificacion de inferencia de lenguaje natural en vietnamita: determina si una premisa implica, contradice o es neutral respecto a una hipotesis.
- Transferencia de aprendizaje entre tareas NLI vietnamitas: el modelo demuestra el impacto de un checkpoint intermedio de ViNLI sobre el rendimiento en ViANLI.
- Clasificacion plana de 3 clases sin cabezas jerarquicas, lo que facilita la reproducibilidad y el analisis.
- Soporte de evaluacion zero-shot sobre ViANLI dev antes del fine-tuning final.
- Capacidad de diagnostico mediante ViMedNLI para evaluar la generalizacion a dominios medicos.
- Reproducibilidad cientifica: el experimento fija semilla 42, fuentes inmutables con hashes SHA y un contrato de artefactos con W&B y HuggingFace.

## Casos de uso

- Reproduccion de experimentos de investigacion: el checkpoint permite reproducir el experimento EXP-001 siguiendo el protocolo documentado, con fuentes inmutables y verificacion de integridad mediante scripts de auditoria.
- Investigacion sobre transferencia de aprendizaje en NLI vietnamita: sirve como punto de referencia para estudiar si el preentrenamiento intermedio en ViNLI mejora el rendimiento en ViANLI, una tarea adversarial mas compleja.
- Estudio de mapeo de cabezas clasificadoras: el intercambio de filas del clasificador (E/N/C a E/C/N) documenta un problema comun en la reutilizacion de checkpoints y su correccion.
- Linea base para experimentos futuros de NLI en vietnamita: los umbrales GO/STOP (Macro-F1 >= 0.500 fuerte, >= 0.485 debil, < 0.480 parada) definen criterios claros para comparar variantes.
- Analisis de sesgos y colapso de clases: el criterio de parada incluye la deteccion de colapso de clases, lo que permite estudiar la estabilidad del entrenamiento en datasets pequenos.
- Evaluacion de generalizacion a dominios especializados: el uso de ViMedNLI como diagnostico permite medir si la transferencia desde ViNLI beneficia a dominios medicos sin entrenamiento explicito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card define umbrales de decision (GO strong: Macro-F1 >= 0.500; GO weak: >= 0.485 sin colapso de clases; STOP: < 0.480) pero no incluye metricas finales obtenidas. El conjunto de test de ViANLI permanece bloqueado y no se evalua en este experimento.

## Requisitos de hardware

- Al ser un modelo basado en BERT para vietnamita, los requisitos de VRAM son moderados, aunque no se dispone de cifras exactas de parametros.
- No se especifican GPUs recomendadas en la informacion disponible.
- Dado el tamano tipico de los modelos BERT base, es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero este dato no esta confirmado.
- El repositorio incluye un notebook de Colab (`notebooks/colab_train_multisource.ipynb`) validado, lo que sugiere que el entrenamiento es viable en entornos de GPU gratuita de Colab.
- Opciones de despliegue: no se documentan herramientas de inferencia especificas (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXP-001) | Flat CafeBERT | NLI vietnamita (ViANLI) | no disponible | no disponible | Checkpoint en HuggingFace |
| CafeBERT original (`uitnlp/CafeBERT`) | BERT vietnamita | Modelo base | no disponible | no disponible | HuggingFace |
| Checkpoint fuente (`hier-nli-e-first-flat-cafebert-vinli`) | Flat CafeBERT con cabezas jerarquicas E-first | NLI vietnamita (ViNLI) | no disponible | no disponible | HuggingFace |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento entre estos modelos. La comparativa se limita a aspectos arquitectonicos y de disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion, no apto para produccion: el modelo es un checkpoint experimental con fines de estudio de viabilidad, no un sistema de NLI listo para uso comercial.
- Unica semilla (42): los resultados no incluyen varianza entre semillas, lo que limita la robustez estadistica de las conclusiones.
- Test de ViANLI bloqueado: no se realiza evaluacion sobre el conjunto de test objetivo, por lo que el rendimiento real en datos no vistos no esta verificado.
- Sin replay ni entrenamiento con ViMedNLI: el experimento excluye deliberadamente estas tecnicas, por lo que el modelo no aprovecha todas las fuentes de datos disponibles.
- Riesgo de sobreajuste: el entrenamiento se realiza sobre solo 8.010 filas de ViANLI, un dataset relativamente pequeno, con criterios de parada basados en Macro-F1 de desarrollo.
- Posible colapso de clases: el protocolo incluye deteccion de colapso de clases como criterio de parada, lo que indica un riesgo conocido en este tipo de entrenamiento.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribucion.
- Idioma limitado: el modelo solo soporta vietnamita, sin capacidades multilingues documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trinhtrantran122/vianli-multisource-transfer-code
- Repositorio GitHub: https://github.com/trantranuit/vianli-multisource-transfer
- Issues del repositorio: https://github.com/trantranuit/vianli-multisource-transfer/issues
- Paper de ViANLI (arXiv): https://arxiv.org/html/2406.17716v2
- Fuente CafeBERT: `uitnlp/CafeBERT@af76fcf2a04096b2b54b348a3e4eb48253c93c5d`
- Fuente ViANLI: `uitnlp/ViANLI@0fec8d6ecb043a61c609f9b51f80401fdf1e84d3`
- Fuente ViNLI mirror: `trantranuit/ViHLM_NLI_Project@47bd78ac5d075bd00a3cb4cdd3ede4eec4acf8c2`
- Fuente ViMedNLI: `justinphan3110/ViPubmed@2cd94305ba48ae1ccf8782c1df9819ddad7f035f`
- Checkpoint fuente: `trinhtrantran122/hier-nli-e-first-flat-cafebert-vinli@3ae7df0b009d14ece648dbdf4cfd88d7ad37f570`
