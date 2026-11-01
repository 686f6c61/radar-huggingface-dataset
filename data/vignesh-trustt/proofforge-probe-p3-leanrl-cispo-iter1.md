# vignesh-trustt/proofforge-probe-p3-leanrl-cispo-iter1

## Resumen

ProofForge P3 probe es un adaptador LoRA (PEFT) publicado por el usuario vignesh-trustt sobre el modelo base Goedel-LM/Goedel-Prover-V2-8B, un modelo de 8.000 millones de parametros especializado en demostracion automatica de teoremas en Lean 4. El adaptador no pretende mejorar al modelo base: el propio autor lo describe explicitamente como una "prueba de fontaneria" (plumbing probe), es decir, un artefacto de validacion de infraestructura de entrenamiento, no un prover mejorado.

El interes tecnico del artefacto reside en que documenta un unico paso de optimizacion con CISPO (un algoritmo de RL con ratio de importancia recortado, variante de PPO aplicada a RLVR) sobre 64 rollouts generados a partir de 8 problemas del split de entrenamiento de Goedel-Pset, con 8 muestras por problema y un limite de 16.384 tokens por generacion. Cada rollout fue verificado por un checker Lean 4 congelado (v4.9.0-rc1, Mathlib d1d1e4b7), lo que convierte al repositorio en un ejemplo reproducible de pipeline RLVR (Reinforcement Learning with Verifiable Rewards) para razonamiento formal.

Es relevante ahora porque el ecosistema de entrenamiento RL para demostracion formal esta creciendo rapidamente y escasean los artefactos publicos que documenten paso a paso la integracion entre generacion, verificacion con Lean y actualizacion de pesos. Aun asi, sus 14 descargas y 0 likes reflejan que es un experimento de nicho, sin evaluacion publicada ni uso recomendado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Goedel-Prover-V2-8B); rango r64, alpha 128, aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8.000 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso un limite de 16.384 tokens por generacion |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors del adaptador; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles (el dominio es Lean 4, con identificadores y sintaxis en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Goedel-Prover-V2-8B mediante LoRA con rango 64 y alpha 128, cubriendo todas las proyecciones de atencion y de las capas MLP. El repositorio ocupa 0,7 GB, coherente con un adaptador de ese rango sobre un modelo de 8B. El entrenamiento consistio en un unico paso del optimizador CISPO (un algoritmo de RL con recorte del ratio de importancia, en la familia de PPO/GRPO aplicada a recompensas verificables) sobre 64 rollouts: 8 problemas del split de entrenamiento de Goedel-Pset por 8 muestras cada uno, con un maximo de 16.384 tokens por generacion. La recompensa provino de un checker Lean 4 congelado en la version v4.9.0-rc1 con Mathlib en el commit d1d1e4b7.

El autor documenta tres comprobaciones de integridad: la varianza de recompensa fue distinta de cero (31 de 62 rollouts aceptados), la actualizacion se aplico efectivamente (252 de 252 tensores `lora_B` modificados) y los log-probabilidades del comportamiento y del entrenador coinciden con un ratio de importancia medio de 1,0000. No se uso ningun enunciado del conjunto de test de miniF2F ni para generacion ni para entrenamiento. No se documentan datos sobre el volumen total de tokens de entrenamiento del modelo base, la composicion de su dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de demostraciones formales en Lean 4, heredada del modelo base Goedel-Prover-V2-8B.
- Razonamiento matematico orientado a prueba formal, con verificacion externa mediante Lean y Mathlib.
- Generacion de texto y codigo en el lenguaje de especificacion de Lean 4.
- Integracion en pipelines de RLVR: el artefacto demuestra el ciclo generacion, verificacion con checker congelado y actualizacion LoRA.
- Compatibilidad con el ecosistema PEFT: carga mediante `PeftModel.from_pretrained` sobre el modelo base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Validacion de infraestructura de RL para demostracion formal: usar el adaptador como referencia para comprobar que un pipeline propio (generacion, verificacion Lean, calculo de recompensa y paso CISPO) produce actualizaciones de pesos correctas, comparando el ratio de importancia y la tasa de aceptacion con las cifras publicadas (31/62 aceptados, ratio 1,0000).
- Depuracion de integraciones PEFT: cargar el adaptador con `PeftModel.from_pretrained` sobre Goedel-Prover-V2-8B para verificar que la fusion de pesos, el guardado y la recarga funcionan en un entorno concreto antes de escalar a entrenamientos mayores.
- Reproduccion de experimentos de RLVR en Lean 4: el repositorio sirve como plantilla minima de un paso de entrenamiento con recompensa verificable, util para investigadores que quieran replicar el flujo con sus propios problemas de Goedel-Pset.
- Pruebas de regresion de checkers Lean: al fijar la version del checker (v4.9.0-rc1) y el commit de Mathlib (d1d1e4b7), el artefacto permite comprobar que una actualizacion del entorno de verificacion no altera la aceptacion de los mismos rollouts.
- Docencia y formacion en RL para razonamiento formal: ejemplifica de forma concreta como se conecta un modelo de lenguaje con un verificador simbolico y como se mide la senal de recompensa en un dominio donde la correccion es comprobable automaticamente.
- Base para ablaciones controladas: partir de este adaptador de un solo paso para medir el efecto de pasos adicionales, cambios de rango LoRA o variaciones del algoritmo CISPO, manteniendo el resto del pipeline fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente "Evaluation: none" y advierte que el adaptador no debe usarse como un modelo mejor que el base. Los unicos numeros publicados son de diagnostico del paso de entrenamiento: 31/62 rollouts aceptados por el checker, 252/252 tensores `lora_B` actualizados y ratio de importancia medio de 1,0000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 8.000 millones de parametros requiere aproximadamente 16 GB en FP16/BF16, unos 8-9 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits (estimaciones generales para un modelo denso de ese tamano, no verificadas en este repositorio).
- GPU recomendadas: no disponible en la informacion proporcionada. Para el modelo base de 8B, una A100, H100 o L40S cubren la inferencia en precision completa; una RTX 4090 (24 GB) es suficiente en BF16.
- Cabe en GPU de consumo: si, para el modelo base cuantizado a 4 u 8 bits en tarjetas con al menos 8-12 GB de VRAM; el adaptador LoRA en si ocupa 0,7 GB.
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained`) sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProofForge P3 probe (este) | Adaptador LoRA sobre 8B | Limite de generacion de 16.384 tokens en entrenamiento | RLVR con CISPO, un solo paso | Apache 2.0 | HuggingFace, 14 descargas |
| Goedel-Prover-V2-8B (base) | 8.000 millones | No disponible | Demostracion formal en Lean 4 | No disponible en la informacion | HuggingFace (Goedel-LM) |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del adaptador ni de comparaciones publicadas con otros provers de Lean 4 en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El autor advierte explicitamente que es una prueba de fontaneria y no un prover mejorado; no debe usarse como sustituto del modelo base.
- No hay evaluacion publicada: no se ha medido su rendimiento en miniF2F ni en ningun otro conjunto de test.
- El entrenamiento se limita a un unico paso del optimizador sobre 64 rollouts y 8 problemas, por lo que el efecto sobre los pesos es minimo y no representa una mejora sistematica.
- Riesgo de alucinacion: inherente al modelo base al generar pasos de prueba; la correccion solo puede garantizarse mediante verificacion externa con Lean 4.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; el dominio efectivo es Lean 4 y matematicas formales.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones de la licencia del modelo base Goedel-Prover-V2-8B, no verificadas en esta ficha.
- Para produccion, es imprescindible validar cualquier salida con un checker Lean de la version adecuada; el adaptador fija Mathlib en el commit d1d1e4b7, lo que puede generar incompatibilidades con entornos mas recientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vignesh-trustt/proofforge-probe-p3-leanrl-cispo-iter1
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este adaptador.
