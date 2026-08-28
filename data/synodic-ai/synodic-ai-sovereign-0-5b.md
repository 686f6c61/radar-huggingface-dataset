# Synodic-AI/Synodic-AI-Sovereign-0.5B

## Resumen

Synodic-AI-Sovereign-0.5B es un modelo de generación de texto de 500 millones de parámetros desarrollado por Synodic-AI Corp., una empresa que se presenta como especializada en soluciones de IA soberana para sectores regulados como sanidad, gobierno y empresa. El modelo es un fine-tuning del Qwen/Qwen2.5-Coder-0.5B-Instruct de Alibaba Cloud, orientado a la síntesis de código de alta precisión y al razonamiento matemático. Su principal atractivo es su tamaño reducido, que permite su despliegue en entornos con recursos limitados, manteniendo un rendimiento declarado excepcional en los benchmarks EvalPlus HumanEval+ y GSM8K, aunque estos resultados no están verificados de forma independiente.

La relevancia de este modelo radica en su propuesta de "IA soberana": un modelo pequeño, de código abierto (licencia Apache 2.0) y entrenado para tareas específicas, que puede ejecutarse localmente sin depender de infraestructuras externas. Esto lo hace atractivo para organizaciones con requisitos estrictos de privacidad y control de datos. Sin embargo, la información pública disponible es muy escasa: no se detallan los datos de entrenamiento, la arquitectura interna ni las capacidades más allá de los dos benchmarks declarados. El modelo se publicó en agosto de 2026 y no registra descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-0.5B-Instruct, no confirmada oficialmente) |
| Parametros totales | 0.5 mil millones (500M) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-0.5B-Instruct soporta 32 768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en la pagina del modelo) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica; probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento de Synodic-AI-Sovereign-0.5B. Al ser un fine-tuning del modelo Qwen/Qwen2.5-Coder-0.5B-Instruct, se asume que hereda la arquitectura transformer decoder-only de Qwen2.5, con atencion por ventanas deslizantes y soporte nativo de funciones (function calling) en el modelo base. Sin embargo, no se especifican los datos de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) ni las innovaciones tecnicas aplicadas en el fine-tuning. La model card solo menciona que el modelo esta orientado a "sintesis de codigo de alta precision y razonamiento", sin aportar mas detalles.

## Capacidades

- Generacion de codigo: el modelo esta especificamente entrenado para sintesis de codigo, con un resultado declarado del 100% en EvalPlus HumanEval+ (Pass@1 estricto).
- Razonamiento matematico: alcanza un 100% de exact match en GSM8K, segun los datos del autor.
- Generacion de texto en ingles: al ser un modelo de lenguaje, puede producir texto coherente en ingles, aunque su especializacion principal es codigo y matematicas.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de pensamiento explicito. El modelo base Qwen2.5-Coder-Instruct soporta function calling, pero no se confirma si este fine-tuning la conserva.

## Casos de uso

- Autocompletado de codigo en entornos con recursos limitados: al tener solo 0.5B de parametros, puede ejecutarse en CPUs o GPUs de gama baja, lo que lo hace util para editores de codigo en dispositivos modestos o entornos de desarrollo embebidos.
- Generacion de codigo en pipelines de CI/CD: su rapida inferencia y bajo consumo permiten integrarlo en etapas de generacion automatica de tests o esqueletos de codigo dentro de pipelines de integracion continua.
- Educacion y formacion en programacion: puede servir como asistente para estudiantes que necesitan ejemplos de codigo o soluciones a problemas de algoritmia, sin requerir infraestructura cloud.
- Prototipado rapido de funciones matematicas: su rendimiento declarado en GSM8K sugiere que puede resolver problemas aritmeticos y de razonamiento numerico, util para generar calculos o validar formulas en aplicaciones de escritorio.
- Despliegue en entornos con requisitos de soberania de datos: organizaciones que necesitan procesar codigo o datos sensibles sin enviarlos a servidores externos pueden ejecutar este modelo localmente, gracias a su tamano reducido y licencia permisiva.
- Investigacion academica sobre modelos pequenos: sirve como punto de partida para estudiar el impacto del fine-tuning en modelos de 0.5B, comparando su rendimiento con el modelo base.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor del modelo en la model card y no estan verificados de forma independiente (campo `verified: false` en el modelo-index). Se presentan tal cual:

| Benchmark | Metrica | Resultado declarado |
|---|---|---|
| EvalPlus HumanEval+ | Pass@1 (estricto) | 100.0% (164/164) |
| GSM8K | Exact Match | 100.0% (1319/1319) |

Estos valores perfectos son altamente inusuales en modelos de este tamano y deben interpretarse con cautela. No se han publicado resultados en otros benchmarks (MMLU, HumanEval original, MBPP, etc.) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0.5B de parametros, en precision FP16 el modelo ocupa aproximadamente 1 GB de VRAM; en cuantizacion INT8, unos 0.5 GB. Estas son estimaciones teoricas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050, o integradas modernas) puede ejecutar el modelo. Tambien es viable en CPU con 4-8 GB de RAM.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer actual.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, aunque no se proporcionan instrucciones oficiales de despliegue.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 4090), un modelo de 0.5B puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|
| Synodic-AI-Sovereign-0.5B | 0.5B | no disponible | Apache 2.0 | HumanEval+ 100%, GSM8K 100% (sin verificar) |
| Qwen2.5-Coder-0.5B-Instruct (modelo base) | 0.5B | 32 768 tokens | Apache 2.0 | HumanEval ~70% (aprox., segun publicaciones de Qwen) |
| StarCoder2-3B | 3B | 16 384 tokens | BigCode OpenRAIL-M | HumanEval ~35% (aprox., segun publicaciones) |

No se dispone de datos oficiales de benchmarks para el modelo base en las mismas condiciones, por lo que la comparacion es orientativa. La diferencia entre el 100% declarado y los valores tipicos de modelos similares sugiere que los resultados de Synodic-AI podrian estar sobreajustados al conjunto de evaluacion o no ser reproducibles.

## Limitaciones y advertencias

- Los benchmarks declarados (100% en HumanEval+ y GSM8K) no estan verificados de forma independiente y son sospechosamente perfectos para un modelo de 0.5B. Es muy probable que no se reproduzcan en entornos reales.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo pequeno, es previsible que tenga una capacidad limitada de razonamiento complejo y una mayor tendencia a alucinar en tareas fuera de su dominio de entrenamiento.
- La model card no especifica el proceso de entrenamiento ni los datos utilizados, lo que impide evaluar riesgos de sesgo o contaminacion de datos.
- No se confirma el soporte de function calling ni de agentes, aunque el modelo base lo incluye.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero al ser un fine-tuning de Qwen, se deben respetar los terminos de la licencia del modelo base (tambien Apache 2.0).
- El modelo solo declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No hay evidencia de mantenimiento activo ni comunidad alrededor del modelo (0 descargas, 0 likes en Hugging Face).

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Synodic-AI/Synodic-AI-Sovereign-0.5B
- Sitio web de Synodic-AI: https://synodic-ai.tech/
- Organizacion Synodic-AI en Hugging Face: https://huggingface.co/Synodic-AI
- GitHub de Synodic-AI: https://github.com/Synodic-AI
- Modelo base Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
