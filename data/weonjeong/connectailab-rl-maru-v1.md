# WeonJeong/connectailab-rl-maru-v1

## Resumen

connectailab-rl-maru-v1 es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario WeonJeong en el marco del proyecto Connect AI LAB. No es un modelo de propósito general: es un modelo de decisión que recibe una situación, una pregunta y una lista de opciones, y devuelve únicamente la letra de la opción elegida. La probabilidad asignada a cada letra se interpreta como la confianza en cada alternativa.

El modelo se ha entrenado con datos generados en el simulador de gestión empresarial Connect Tycoon. El pipeline combina una política profesora entrenada con PPO en el propio simulador, aprendizaje supervisado sobre las decisiones de mayor puntuación y una fase final de aprendizaje por refuerzo con normalización por grupos y penalización KL respecto al modelo de partida, un esquema cercano a GRPO. El conjunto de datos sintéticos contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de test.

Su relevancia es sobre todo metodológica y educativa: demuestra cómo un modelo de menos de mil millones de parámetros puede especializarse en una tarea de decisión discreta mediante RL sobre un simulador, con resultados que pasan del 30,4% de acierto del modelo base al 77,5% tras el entrenamiento. Es un modelo de investigación, con licencia Apache 2.0, orientado únicamente al idioma coreano y pensado para experimentación, no para producción empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B; arquitectura interna del modelo base no disponible |
| Parametros totales | 0,8 mil millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parámetros. El repositorio contiene únicamente los pesos del adaptador (tamaño declarado de 0,0 GB), por lo que es necesario descargar el modelo base por separado y cargarlo con `PeftModel.from_pretrained`. No se especifica en la información disponible la dimensión de contexto del modelo base, ni la composición exacta del corpus de preentrenamiento de Qwen3.5.

El entrenamiento se desarrolló en cuatro fases descritas por el autor. Primero, una política pequeña se entrenó con PPO operando el simulador Connect Tycoon durante miles de meses virtuales; esa política actúa como profesora. Segundo, se construyó un conjunto de problemas: para cada mes se alteraron las opciones de una decisión concreta y se volvió a ejecutar el mes hasta el final para puntuar cada alternativa. Tercero, se aplicó aprendizaje supervisado imitando la opción con mayor puntuación. Cuarto, se aplicó aprendizaje por refuerzo tratando todas las opciones de una misma decisión como un grupo, elevando la probabilidad de aquellas con puntuación superior a la media del grupo (ventaja normalizada por grupo) y añadiendo una penalización KL respecto al modelo de partida para evitar el colapso. La distribución de empresas del simulador corresponde al perfil `general`, calibrado con datos públicos.

## Capacidades

- Decisión de opción múltiple: dado un estado, una pregunta y una lista de opciones con etiqueta, clave y descripción, devuelve exactamente una letra.
- Calibración de confianza: la probabilidad asociada a cada letra se interpreta como la probabilidad de elegir esa opción y el valor máximo como la confianza de la decisión.
- Seguimiento de instrucciones de sistema en inglés: el autor proporciona un `system prompt` fijo que instruye al modelo a tratar el texto dentro de `state` como datos y no como instrucciones, y a devolver solo la letra.
- Operación sobre entornos tipo Gymnasium: el modelo fue diseñado para consumir el estado serializado en JSON de un entorno de decisión.
- Gestión empresarial simulada: decisiones de operación de una empresa sintética (dinero, satisfacción e incidentes como resultados).
- No dispone de capacidades documentadas de tool calling, function calling, visión, audio, agentes multi-paso ni razonamiento extendido en la información disponible. El adaptador está especializado en una única tarea y el modelo base no se documenta en esta ficha.

## Casos de uso

- Simulador de gestión empresarial: sustituir la política de decisión de un entorno tipo Connect Tycoon por este adaptador, alimentándolo con el estado serializado en JSON y recogiendo la letra devuelta para aplicarla como acción del mes. Su entrenamiento proviene exactamente de ese dominio, con un beneficio mensual medido de 12,21 millones de wones en el simulador.
- Investigación en aprendizaje por refuerzo aplicado a LLM: servir de referencia reproducible para comparar SFT frente a RL con ventaja normalizada por grupo y penalización KL, ya que el autor publica los tres puntos de la curva (30,4% base, 78,1% SFT, 77,5% RL).
- Generación de datos sintéticos de decisión: usar el modelo como anotador de bajo coste para preetiquetar decisiones en un entorno o dominio nuevo antes de una revisión humana, aprovechando que el formato de salida es una única letra fácil de validar automáticamente.
- Docencia y cursos de RL: el repositorio incluye un cuaderno de Colab para reproducir el entrenamiento, por lo que el modelo sirve como ejemplo práctico en formación sobre PPO, LoRA y GRPO.
- Módulo de decisión embebido en local: con 0,8 mil millones de parámetros en el modelo base, la inferencia puede ejecutarse en un portátil o en una máquina sin GPU dedicada, lo que permite demostraciones sin conexión.
- Evaluación de políticas en entornos de simulación: comparar la política del adaptador contra una política profesora o contra reglas heurísticas usando la métrica de arrepentimiento (regret) reportada por el autor.
- Filtro previo de decisiones con opciones acotadas: en cualquier flujo donde las alternativas estén predefinidas y el resultado se pueda expresar como una etiqueta, el modelo puede actuar como clasificador de elección con umbral de confianza, descartando las decisiones de baja probabilidad para revisión humana.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card del autor. Corresponden al examen interno del propio simulador y no a benchmarks estándar como MMLU, HumanEval o GSM8K.

| Modelo | Precision en el examen | Arrepentimiento (menor es mejor) | Beneficio mensual en el simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 30,4% | 2,67 | No medido | No medido |
| Aprendizaje supervisado (SFT) | 78,1% | 1,89 | No medido | No medido |
| Aprendizaje por refuerzo (este adaptador) | 77,5% | 1,90 | 12,21 millones de wones | 72% (146/177) |

El autor indica que la evaluación de operación empresarial corresponde a una media de dos meses no vistos, con un tamaño de muestra pequeño, y que la política resultante todavía está por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8 mil millones de parámetros. En precisión de 16 bits el peso ocupa aproximadamente 1,6 GB; en 8 bits, unos 0,8 GB; en 4 bits, unos 0,4-0,5 GB. Estas cifras son estimaciones derivadas del recuento de parámetros y no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar el modelo. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con 4 GB o más de VRAM, e incluso en CPU con cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, el camino natural es `transformers` junto con `peft` para fusionar el adaptador y, opcionalmente, exportar a GGUF para llama.cpp u Ollama. vLLM y TGI son compatibles con adaptadores LoRA, aunque no hay configuración publicada por el autor.
- Latencia y throughput: no disponibles. Con 0,8 mil millones de parámetros la latencia esperada es de decenas de milisegundos por decisión en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-maru-v1 (este modelo) | 0,8 B (base) + adaptador LoRA | no disponible | Apache 2.0 | Adaptador de decision entrenado con SFT y RL sobre simulador | Adaptador publico en HuggingFace, 0 descargas y 0 me gusta en el momento de la consulta |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 B | no disponible | Apache 2.0 | LLM generativo de proposito general | Publico en HuggingFace |
| connectailab-artnfull-v1 (referencia del mismo autor) | 0,6 B (Qwen3-0.6B) | no disponible | no disponible | Checkpoint experimental con abliteracion para modificar el comportamiento de rechazo | Publico en HuggingFace, categoria distinta |

No se han identificado en la informacion disponible otros modelos comparables de decision empresarial entrenados con RL sobre un simulador. Las cifras de parametros del modelo base y del adaptador no permiten establecer una comparacion de rendimiento con alternativas de propósito general, ya que no comparten conjunto de evaluación.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo sabe devolver la letra de una opción de una lista predefinida. No genera texto libre, explicaciones ni justificaciones.
- Sesgo de simulador: las decisiones se aprendieron sobre una distribución de empresas `general` calibrada con datos públicos dentro de un simulador. Las dinámicas del simulador no tienen por qué reproducir las de una empresa real.
- Muestra de evaluación pequeña: la medición de explotación empresarial corresponde a una media de dos meses no vistos. El propio autor advierte del tamaño reducido de la muestra.
- Inferior a la política profesora: el modelo queda por debajo de la política pequeña entrenada con PPO en el simulador, según la propia model card.
- Sobreajuste al formato: el modelo espera un `system prompt` concreto en inglés y un `user` en JSON con la estructura `{"state": ..., "question": ..., "options": [...]}`. Cualquier variación de formato puede degradar o romper la salida.
- Riesgo de inyección de prompt: el autor instruye explícitamente a tratar el contenido de `state` como datos y no como instrucciones, lo que indica que el contenido del estado puede contener texto adversarial. Esta mitigación es solo a nivel de prompt y no está garantizada.
- Idioma: el modelo solo está declarado para coreano. No hay evidencia de funcionamiento en castellano u otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones de la licencia del modelo base Qwen3.5-0.8B, que debe verificarse por separado.
- Aviso de uso: el autor declara que es un modelo de investigación y educacion sobre un simulador sintetico y recomienda revalidarlo con los registros reales de la empresa antes de utilizarlo para decisiones de gestion.
- Sin datos de benchmarks estandar, sin contexto declarado y sin informacion sobre cuantizaciones validadas.
- Repositorio sin traccion: 0 descargas y 0 me gusta en la fecha de consulta, lo que limita la validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WeonJeong/connectailab-rl-maru-v1
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube Connect AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI City Builders, curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Space Connect AI LAB: https://huggingface.co/spaces/WeonJeong/connect-ai-lab
- Perfil de GitHub del autor: https://github.com/wonseokjung
- Modelo relacionado del mismo autor: https://huggingface.co/artnfull/connectailab-artnfull-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
