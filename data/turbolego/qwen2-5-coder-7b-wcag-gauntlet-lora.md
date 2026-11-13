# Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora

## Resumen

El modelo `Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora` es un ajuste fino mediante LoRA del modelo base Qwen2.5-Coder-7B, desarrollado por el usuario Turbolego. Su objetivo es convertir una habilidad concreta, la evaluacion de accesibilidad web segun el estandar WCAG 2.2, en una capacidad estructurada de uso de herramientas (tool-use). En lugar de generar correcciones de accesibilidad de forma libre y potencialmente erronea, el modelo aprende a emitir decisiones de enrutamiento (`next_tool`) y ejecutar comprobaciones de accesibilidad (`run_precheck`) de manera fiable.

El modelo parte de la arquitectura del transformer decoder-only de Qwen2.5-Coder-7B, con 7.615.616.512 parametros totales, y se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M (4,36 GB), lo que permite su ejecucion en GPUs de consumo con tan solo 6 GB de VRAM. El repositorio, de 4,7 GB, incluye tambien pesos compatibles con la libreria transformers.

Su relevancia radica en que demuestra un patron de especializacion muy concreto: tomar un modelo de codigo generalista y ensenarle a invocar correctamente herramientas de un dominio especifico (accesibilidad WCAG 2.2) mediante trayectorias sinteticas de tool-use evaluadas contra un benchmark propio. Es un ejemplo practico de como un LoRA pequeno puede reducir la alucinacion en tareas de dominio acotado, aunque su alcance queda limitado a ese nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-7B) con adaptador LoRA fusionado |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos f16 convertidos a GGUF; safetensors del merge |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M), safetensors (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Coder-7B, un transformer decoder-only especializado en codigo. Sobre el se aplica un ajuste fino con LoRA (PEFT), entrenado en Kaggle (GPUs T4/P100) porque el hardware local del autor (GTX 860M con 2 GB) no permitia entrenar un modelo de 7B. Los datos de entrenamiento son trayectorias sinteticas de uso de herramientas WCAG 2.2, generadas a partir de las definiciones del proyecto wcag-skill y puntuadas contra el arnes de evaluacion AI-WCAG-Gauntlet. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Tras el entrenamiento, los pesos LoRA se fusionan en el modelo base, se convierten a GGUF en f16 y se cuantizan a Q4_K_M con `llama-quantize` de llama.cpp, resultando en un archivo de 4,36 GB. La innovacion tecnica principal no esta en la arquitectura, sino en el enfoque de entrenamiento: ensenar al modelo a emitir decisiones de enrutamiento y comprobaciones estructuradas en lugar de correcciones libres, lo que reduce la alucinacion en el dominio de accesibilidad.

## Capacidades

- Generacion de texto y codigo heredada del modelo base Qwen2.5-Coder-7B.
- Uso de herramientas estructurado: emision de decisiones `next_tool` para enrutar hacia la habilidad WCAG adecuada.
- Ejecucion de comprobaciones de accesibilidad mediante `run_precheck`.
- Deteccion de problemas de accesibilidad web segun WCAG 2.2 en paginas web y fragmentos de codigo.
- Formato conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponibles (no declaradas en la informacion).
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Auditoria automatizada de accesibilidad en pipelines de CI/CD: el modelo puede integrarse para ejecutar `run_precheck` sobre fragmentos HTML y emitir el enrutamiento `next_tool` correspondiente, detectando violaciones WCAG 2.2 antes de desplegar.
- Asistente de revision de pull requests: al revisar cambios en plantillas o componentes frontend, el modelo invoca las comprobaciones de accesibilidad y senala que herramienta WCAG debe aplicarse a continuacion.
- Herramienta de desarrollo en el IDE: integrado via llama.cpp u Ollama, ofrece sugerencias de accesibilidad estructuradas en lugar de correcciones inventadas, reduciendo falsos positivos.
- Enrutamiento dentro de un agente de accesibilidad: dado un problema detectado, el modelo decide que habilidad WCAG invocar (`next_tool`), actuando como capa de orquestacion.
- Formacion y concienciacion: sirve como ejemplo de referencia para equipos que quieran construir sus propios asistentes de accesibilidad con tool-use fiable.
- Despliegue en hardware modesto: gracias a su cuantizacion Q4_K_M (4,36 GB, cabe en 6 GB de VRAM), puede ejecutarse en estaciones de trabajo con GPUs de consumo para tareas de revision de accesibilidad en local.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son metricas propias sobre el conjunto de test retenido:

| Metrica | Resultado |
|---|---|
| Precision de enrutamiento `next_tool` | 98,7% |
| Correccion de `run_precheck` | 100,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB con la cuantizacion Q4_K_M (archivo de 4,36 GB).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor menciona que cabe en GPUs de consumo.
- Cabe en GPU de consumo: si, con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070 y superiores).
- Opciones de despliegue: Ollama, llama.cpp y cualquier runtime compatible con GGUF; tambien carga via transformers con los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora | 7,6B | no disponible | apache-2.0 | GGUF Q4_K_M, safetensors | Especializado en tool-use WCAG 2.2 |
| Qwen/Qwen2.5-Coder-7B | 7,6B | no disponible | apache-2.0 | safetensors, GGUF | Modelo base generalista de codigo |
| Otros ajustes LoRA de Qwen2.5-Coder-7B | 7,6B | no disponible | variable | variable | Depende del ajuste concreto |

No se dispone de datos de benchmarks comparativos frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en un dominio muy acotado (tool-use WCAG 2.2); su rendimiento fuera de ese dominio depende del modelo base y no esta evaluado.
- Riesgo de alucinacion en correcciones de accesibilidad libres: el diseno busca evitarlo enrutando a herramientas, pero no se garantiza fuera de ese flujo.
- Las metricas reportadas (98,7% y 100,0%) proceden del conjunto de test propio del autor y no han sido verificadas de forma independiente.
- No se declaran los idiomas soportados; el comportamiento multilingue no esta confirmado.
- Longitud de contexto no disponible en la informacion.
- Licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-Coder-7B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificados.
- Entrenado en Kaggle con recursos limitados (T4/P100); el proceso de entrenamiento no esta documentado en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Turbolego/qwen2.5-coder-7b-wcag-gauntlet-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Benchmark harness: https://github.com/turbolego/AI-WCAG-Gauntlet
- Skill ensenada: https://github.com/turbolego/wcag-skill
- Skill en Clawhub: https://clawhub.ai/turbolego/skills/wcag-skill
