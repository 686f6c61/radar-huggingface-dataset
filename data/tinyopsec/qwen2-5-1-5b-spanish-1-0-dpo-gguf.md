# tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF

## Resumen

`tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF` es una version cuantizada en formato GGUF del modelo `Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO`, un ajuste fino del modelo base Qwen2.5-1.5B-Instruct orientado al castellano y afinado mediante DPO (Direct Preference Optimization). El autor de la cuantizacion es el usuario de Hugging Face tinyopsec, mientras que el modelo original fue desarrollado por Kukedlc. El paquete resuelve el problema de desplegar un modelo conversacional en castellano en entornos con recursos limitados, ya que ofrece 13 variantes de cuantizacion entre F16 y Q2_K.

El modelo cuenta con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), lo que lo situa en la gama de modelos pequenos aptos para hardware de consumo. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atencion por ventanas deslizantes y RoPE, si bien la model card no detalla la longitud de contexto especifica de esta variante. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos.

Su relevancia actual reside en la combinacion de tres factores: es un modelo en castellano afinado con preferencias humanas (DPO), esta disponible en GGUF para su ejecucion con llama.cpp y runtimes compatibles (Ollama, LM Studio, koboldcpp), y su tamano permite inferencia en CPU o en GPUs de gama media. El repositorio acumula 663 descargas y el tamano total del repo es de 15,3 GB, correspondiente a la suma de todas las cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | castellano (modelo afinado para espanol); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con 1,5 mil millones de parametros. Sobre el se aplico un ajuste fino en castellano seguido de una fase de DPO (Direct Preference Optimization) utilizando, segun la model card, el dataset Big-Spanish-1.2M y pares DPO derivados de Orca. La model card no especifica el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni los hiperparametros del DPO.

La innovacion principal de este repositorio no esta en la arquitectura, sino en la distribucion: se ofrecen 13 cuantizaciones GGUF generadas con llama.cpp, desde F16 (3,0 GB) hasta Q2_K, lo que permite elegir el equilibrio entre calidad y consumo de memoria. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en castellano, con ajuste por preferencias humanas (DPO) que deberia mejorar la calidad y el tono de las respuestas.
- Razonamiento basico y respuesta a instrucciones, heredado de Qwen2.5-1.5B-Instruct.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano).
- Soporte de conversaciones multi-turno mediante plantilla de chat de Qwen2.5.
- Compatibilidad con runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el modelo esta orientado al castellano; el resto de idiomas no esta documentado.
- Vision, audio o modo thinking: no disponible (modelo solo de texto).

## Casos de uso

- Asistentes conversacionales en castellano para aplicaciones web o moviles: el modelo puede gestionar dialogos multi-turno con un consumo de memoria reducido (a partir de aproximadamente 1 GB en Q4_K_M), lo que permite desplegarlo en servidores modestos o incluso en dispositivos de borde.
- Prototipado rapido de chatbots: gracias a la disponibilidad de GGUF y a la compatibilidad con Ollama y llama.cpp, un equipo puede tener un asistente en castellano funcionando en minutos sin infraestructura GPU dedicada.
- Generacion de texto y resumenes en espanol: adecuado para tareas de redaccion asistida, resumen de documentos y reescritura, donde el ajuste DPO en castellano aporta un tono mas natural que el modelo base.
- Clasificacion y extraccion de informacion en espanol: el modelo puede usarse para etiquetar textos, extraer entidades o responder preguntas sobre documentos cortos en un pipeline de procesamiento por lotes en CPU.
- Educacion y tutoria automatizada: respuestas en castellano para preguntas frecuentes, explicaciones sencillas y ejercicios, con la ventaja de que el modelo puede ejecutarse localmente sin enviar datos a terceros.
- Despliegue en entornos con privacidad estricta: al ejecutarse en local con llama.cpp, permite procesar texto en castellano sin conexion a internet, util en sectores regulados.
- Generacion de codigo en espanol para tareas sencillas: puede asistir en snippets y explicaciones, aunque su tamano limita la complejidad de los proyectos que puede abordar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0 GB en F16, 1,6 GB en Q8_0, 1,2 GB en Q6_K, 1,1 GB en Q5_K_M, 0,9 GB en Q4_K_M y 0,7 GB en Q2_K (estimaciones basadas en el tamano de los ficheros GGUF publicados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es lo suficientemente pequeno como para no necesitar GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son compatibles directamente con GGUF sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF | 1,54 B | no disponible | castellano | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO | 1,54 B | no disponible | castellano | Apache 2.0 | safetensors |
| Salamandra-2B (BSC) | 2 B | no disponible | multilingue (incl. castellano) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a parametros, licencia y formato porque no hay datos de benchmarks publicados en la informacion disponible. La ventaja principal de esta variante frente al modelo original de Kukedlc es la disponibilidad de cuantizaciones GGUF listas para usar; frente a Qwen2.5-1.5B-Instruct, el ajuste DPO en castellano deberia ofrecer respuestas mas naturales en espanol.

## Limitaciones y advertencias

- Modelo de 1,5 mil millones de parametros: capacidad de razonamiento limitada en comparacion con modelos de 7B o superiores; puede fallar en tareas complejas de matematicas, codigo o logica.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa con apariencia de veracidad, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset Big-Spanish-1.2M y los pares Orca pueden introducir sesgos de dominio y estilo.
- Contexto: la longitud de contexto no esta documentada en la model card; conviene verificarla antes de usarla en produccion con documentos largos.
- Idiomas: el modelo esta afinado para castellano; su rendimiento en otros idiomas no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor original recomienda evaluar el modelo antes de usarlo en produccion.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Fecha de creacion del repositorio (2026-10-27): conviene verificar que la informacion y los ficheros sigan vigentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF
- Modelo base (original): https://huggingface.co/Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
