# XujjHarvard/cs2881-hw1-rlaif

## Resumen

cs2881-hw1-rlaif es un ajuste fino supervisado por refuerzo (RLAIF) del modelo denso Qwen2.5-3B-Instruct, publicado por el usuario XujjHarvard como entrega de la práctica 1 de un curso con código CS2881. El autor describe el trabajo como la continuación del "Setting B", empleando GRPO (Group Relative Policy Optimization) con un juez automático basado en gpt-4o-mini que actúa como recompensa midiendo la adherencia a una persona concreta ("Sheldon-adherence"). No es, por tanto, un modelo de propósito general nuevo, sino un artefacto de investigación académica sobre métodos de alineamiento.

El resultado declarado es el siguiente: la métrica clf_style sube de 0,571 a 0,876 y la métrica register pasa de 1,569 a 2,108, manteniendo (según el autor, sin cifras) la capacidad del modelo base. El repositorio contiene el modelo ya fusionado (merged) en la raíz y el adaptador LoRA en el subdirectorio `adapter/`, con pesos en safetensors y licencia Apache-2.0.

Su relevancia es metodológica antes que práctica: sirve como ejemplo reproducible y de bajo coste (3.085.938.688 parámetros) de un pipeline RLAIF con GRPO y recompensa basada en un LLM juez, un enfoque cada vez más habitual para controlar estilo, registro y persona sin etiquetado humano. El repositorio no tiene descargas ni "likes" y no incluye documentación técnica detallada, por lo que debe tratarse como material de estudio, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), heredada del modelo base Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09 mil millones, dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card del ajuste; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible. Los pesos del repositorio están en safetensors (precisión no declarada); al derivar de Qwen2.5 son convertibles a GGUF, AWQ y GPTQ con herramientas estándar |
| Idiomas soportados | no disponible en la información del repositorio; el modelo base es multilingüe, pero el ajuste RLAIF se evaluó con métricas en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raíz del repo) + adaptador LoRA en `adapter/` |
| Tamaño del repositorio | 6,4 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La base es Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.090 millones de parámetros con atención de consultas agrupadas (GQA) y tokenizador BPE multilingüe. Sobre ese modelo se aplicó un ajuste fino con LoRA y posteriormente una fase de optimización por refuerzo; el repositorio publica tanto el adaptador (`adapter/`) como el modelo ya fusionado en la raíz.

El método de entrenamiento es GRPO (Group Relative Policy Optimization), una variante de optimización de política sin crítico que estima la ventaja relativa dentro de un grupo de respuestas muestreadas para la misma instrucción. La señal de recompensa no proviene de anotadores humanos sino de un juez automático basado en gpt-4o-mini que puntúa la adherencia a una persona definida (el autor la denomina "Sheldon-adherence"), lo que sitúa el trabajo en el paradigma RLAIF. El autor menciona que se trata de la continuación del "Setting B" de la práctica, pero no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el número de pasos de GRPO, el rango del adaptador LoRA ni los hiperparámetros empleados. Tampoco se detalla si hubo etapas previas de SFT o DPO.

Las únicas métricas reportadas por el autor son dos índices de estilo y registro (clf_style y register) medidos antes y después de la fase RLAIF, más la afirmación cualitativa de que la capacidad del modelo se mantuvo. No se describe la metodología de evaluación ni el conjunto de test utilizado.

## Capacidades

- Generación de texto e instrucciones generales, heredadas del modelo base Qwen2.5-3B-Instruct.
- Control de persona y estilo: es la capacidad central del ajuste. El modelo fue optimizado para adoptar un registro y una forma de expresarse concretos, medidos con los índices clf_style (0,876) y register (2,108).
- Cambio de registro lingüístico: el aumento de la métrica register indica una tendencia a producir un habla más formal, pedante o característica, según la definición que use el juez del autor.
- Razonamiento de un solo turno: no hay evidencia publicada de mejoras en razonamiento multi-paso; el autor indica que la capacidad se mantuvo, no que aumentara.
- Soporte de tool calling / function calling: no disponible. El modelo base Qwen2.5-3B-Instruct lo soporta, pero no hay confirmación ni evaluación en este ajuste.
- Soporte de agentes: no disponible; no se documenta entrenamiento en tareas multi-paso ni uso de herramientas.
- Capacidades multilingües: no disponible. El modelo base es multilingüe, pero el ajuste y sus métricas están descritos en inglés.
- Modo thinking explícito, visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidad de servir como generador de datos estilizados o como actor en un bucle RLAIF reproducible.

## Casos de uso

- Investigación y docencia sobre RLAIF: reproducir el pipeline de GRPO con un juez LLM (gpt-4o-mini) y comparar el efecto de distintas funciones de recompensa sobre el estilo de salida. Es el uso natural de una entrega académica con adaptador LoRA separado.
- Aprendizaje por imitación de persona o personaje: el modelo puede emplearse para generar diálogos con una voz muy marcada (pedante, formal, con muletillas), útil en prototipos de narrativa interactiva o bots de personaje.
- Generación de datos sintéticos con registro controlado: producir corpus de texto con un estilo concreto para entrenar clasificadores de estilo o para aumentar datasets de NLP donde la variación de registro es escasa.
- Pruebas de robustez de jueces automáticos: enfrentar este modelo a jueces LLM y medir la correlación entre puntuaciones automáticas y evaluación humana, un problema abierto en RLAIF.
- Experimentos de ablación de hiperparámetros: al partir del adaptador publicado, se puede variar el coeficiente KL, el tamaño de grupo de GRPO o la temperatura y medir el impacto en clf_style y register.
- Despliegue local de bajo coste para demos: con 3,09 mil millones de parámetros cabe en una GPU de consumo y permite servir una demo interactiva en un portátil con GPU de 8 GB o en CPU mediante llama.cpp.
- Base para ajustes posteriores: el adaptador LoRA es reutilizable como punto de partida para nuevas fases de RLHF/RLAIF o DPO con otros objetivos de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta dos métricas internas de estilo, sin comparación con otros modelos y sin describir el conjunto de evaluación:

| Metrica | Antes (Setting B) | Despues (RLAIF con GRPO) |
|---|---|---|
| clf_style | 0,571 | 0,876 |
| register | 1,569 | 2,108 |
| Capacidad general | no disponible | "capability held" (sin cifras) |

Estos valores proceden exclusivamente de la model card del autor, no están validados externamente y las escalas de clf_style y register no están definidas en la documentación disponible, por lo que no son comparables con métricas de otros modelos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos fusionados): unos 6,2 GB solo de pesos; con caché KV y activaciones, alrededor de 8 GB para contextos moderados.
- VRAM estimada en int8: aproximadamente 3,1 GB de pesos, unos 5 GB en total.
- VRAM estimada en GGUF Q4_K_M: alrededor de 1,9-2,2 GB de pesos, con unos 4 GB en total incluyendo caché KV.
- Caché KV: la estimación para 32.768 tokens en bf16 ronda 1,2 GB, calculada a partir de 36 capas con 2 cabezas KV por capa (aproximación, no medida por el autor).
- GPU recomendadas: H100, A100 o L40S para servir en fp16 con lotes grandes; RTX 4090 o RTX 6000 Ada para desarrollo; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 como mínimo para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en cuantización de 4 bits, y en 6 GB con cuantización agresiva y contexto reducido. También es viable en CPU con llama.cpp u Ollama, con latencias de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: Transformers + PEFT (para cargar el adaptador `adapter/`), vLLM, TGI, SGLang, llama.cpp, Ollama y LM Studio tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento de este ajuste frente a alternativas, así que la comparación se limita a características declaradas:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| cs2881-hw1-rlaif | 3,09 B (denso) | heredado de Qwen2.5-3B (32.768 tokens, no confirmado) | Apache-2.0 | RLAIF con GRPO y juez gpt-4o-mini para control de persona |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B (denso) | 32.768 tokens nativos | Apache-2.0 | Instrucciones generales, alineamiento estándar |
| Llama-3.2-3B-Instruct | 3,21 B (denso) | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales, licencia con restricciones para grandes despliegues |
| Phi-3.5-mini-instruct | 3,82 B (denso) | 128.000 tokens | MIT | Instrucciones, razonamiento y código en tamaño reducido |

Ninguno de los modelos comparables persigue el mismo objetivo de estilo, por lo que no existe una comparación de rendimiento significativa en la información proporcionada.

## Limitaciones y advertencias

- Artefacto académico sin validación externa: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks públicos ni revisión por pares.
- Sesgo inducido deliberadamente: el ajuste empuja la salida hacia una persona concreta, lo que puede degradar la neutralidad y la utilidad general del modelo en tareas ajenas a ese estilo.
- Riesgo de sobreajuste al estilo: no se documenta ningún mecanismo de regularización (coeficiente KL, mezcla con datos generales) ni se aportan cifras sobre la degradación real de capacidades; la afirmación "capability held" no está cuantificada.
- Alucinación: al ser un modelo de 3 B parámetros, la tasa de invención de hechos es inherentemente alta, especialmente en dominios especializados y en tareas de razonamiento largo.
- Limitaciones de contexto e idioma: no hay confirmación del contexto efectivo tras el ajuste ni evidencia de calidad en idiomas distintos del inglés.
- Posible conflicto de propiedad intelectual: la optimización hacia una persona reconocible puede implicar uso de personajes protegidos, con riesgo legal si se comercializa el resultado.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda también la del modelo base (Apache-2.0), que no impone restricciones adicionales conocidas; aun así, el usuario es responsable del contenido generado con la persona imitada.
- Trazabilidad limitada: se desconoce el dataset de entrenamiento, los prompts, los hiperparámetros y la definición de las métricas clf_style y register, lo que impide reproducir el resultado a partir de la model card.
- Metadatos anómalos: la fecha declarada de creación (2026-09-17) no coincide con el estado actual del repositorio; conviene verificar la integridad del artefacto antes de reutilizarlo.
- Dependencia de un juez externo: el pipeline original presupone acceso a gpt-4o-mini, un servicio propietario, lo que rompe la reproducibilidad completamente abierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XujjHarvard/cs2881-hw1-rlaif
- Adaptador LoRA dentro del repositorio: https://huggingface.co/XujjHarvard/cs2881-hw1-rlaif/tree/main/adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Referencia del algoritmo GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Referencia de RLAIF (Scaling Reinforcement Learning from Human Feedback with AI Feedback): https://arxiv.org/abs/2309.00267

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores son los del propio repositorio y referencias estándar de las técnicas citadas, no material encontrado en dicha búsqueda.
