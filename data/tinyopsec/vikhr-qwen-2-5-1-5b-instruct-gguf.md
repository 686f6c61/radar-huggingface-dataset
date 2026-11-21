# tinyopsec/Vikhr-Qwen-2.5-1.5B-Instruct-GGUF

## Resumen

Vikhr-Qwen-2.5-1.5B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Vikhr-Qwen-2.5-1.5B-Instruct, publicado por el usuario tinyopsec en Hugging Face. Se trata de un ajuste fino supervisado del modelo base Qwen2.5-1.5B-Instruct de Alibaba, orientado a seguir instrucciones en ruso e ingles y entrenado por Vikhrmodels con el conjunto de datos GrandMaster-PRO-MAX. El modelo cuenta con 1.543.298.048 parametros y una ventana de contexto heredada de la arquitectura Qwen2.

El interes de esta publicacion es practico: ofrece hasta trece variantes de cuantizacion (desde F16 hasta Q2_K) generadas con llama.cpp, lo que permite desplegar el modelo en hardware muy modesto, incluidos equipos de consumo sin GPU dedicada. Al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime que soporte este formato.

Es relevante para desarrolladores que necesitan un modelo pequeno, ligero y con licencia Apache 2.0 para tareas de generacion de texto conversacional en ruso e ingles, especialmente en entornos con recursos limitados o en despliegues locales sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.298.048 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ruso e ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2, con 1.500 millones de parametros aproximadamente. Sobre esa base, Vikhrmodels aplico un ajuste fino supervisado para mejorar el seguimiento de instrucciones en ruso e ingles, empleando el conjunto de datos GrandMaster-PRO-MAX. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

Esta publicacion concreta no introduce cambios arquitectonicos: es una conversion a GGUF realizada con llama.cpp a partir de los pesos originales en safetensors. Las innovaciones tecnicas se limitan, por tanto, al ajuste fino del modelo base y a la disponibilidad de multiples niveles de cuantizacion que permiten equilibrar calidad y consumo de memoria.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en ruso e ingles.
- Razonamiento basico y respuesta a preguntas dentro del rango de un modelo de 1.5B parametros.
- Generacion de codigo y tareas de transformacion de texto, con calidad limitada por el tamano del modelo.
- Conversacion multi-turno mediante plantillas de chat compatibles con Qwen2.
- Despliegue local en runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede gestionar dialogos multi-turno en un portatil sin GPU dedicada usando la cuantizacion Q4_K_M, que ocupa alrededor de 1 GB y permite inferencia por CPU.
- Clasificacion y etiquetado de texto en ruso: util para categorizar tickets, resenas o correos en pipelines por lotes donde el coste por token es critico y la latencia no es restrictiva.
- Generacion de respuestas en centros de soporte de bajo volumen: integrado en Ollama o llama.cpp, sirve como primera linea de respuesta para consultas frecuentes en ruso e ingles.
- Prototipado rapido de aplicaciones de IA: al ser un modelo de 1.5B en GGUF, permite validar prompts y flujos conversacionales en local antes de migrar a modelos mayores.
- Traduccion y reformulacion de textos entre ruso e ingles: tareas de parafrasis, resumen y adaptacion de tono en documentos cortos.
- Educacion y demostraciones: adecuado para ensenar conceptos de cuantizacion y despliegue de LLM en entornos academicos con hardware limitado.
- Procesamiento por lotes en servidores sin GPU: la variante Q8_0 o Q4_K_M puede ejecutarse en CPU con throughput moderado para tareas de generacion masiva de texto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun cuantizacion):
  - F16: ~3,0 GB
  - Q8_0: ~1,7 GB
  - Q6_K: ~1,3 GB
  - Q5_K_M: ~1,1 GB
  - Q4_K_M: ~1,0 GB
  - Q2_K: ~0,7 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; para cuantizaciones Q4 o inferiores basta con 2 GB. Una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Tambien funciona enteramente en CPU, lo que lo hace apto para portatiles y mini-PC.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Vikhr-Qwen-2.5-1.5B-Instruct-GGUF | 1,54B | no disponible | Ruso, ingles | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible | Multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24B | 128K (segun model card oficial) | Multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | 2,6B | 8K (segun model card oficial) | Multilingue | Gemma Terms of Use | safetensors, GGUF |

La ventaja principal de este modelo frente a las alternativas es su especializacion en ruso mediante ajuste fino, junto con la licencia Apache 2.0, mas permisiva que las licencias de Llama o Gemma. Frente al Qwen2.5-1.5B-Instruct original, ofrece mejor rendimiento esperado en ruso a costa de un posible deterioro en otros idiomas no cubiertos por el ajuste fino.

## Limitaciones y advertencias

- Modelo de 1.5B parametros: capacidad de razonamiento, conocimiento factual y calidad de codigo inferiores a modelos de 7B o superiores.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en preguntas factuales o tareas de matematicas complejas.
- Idiomas soportados limitados a ruso e ingles segun la model card; el rendimiento en castellano no esta garantizado.
- La longitud de contexto no se documenta en la informacion disponible; conviene verificar la configuracion del modelo base antes de usarlo con prompts largos.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda Q4_K_M o superior para uso en produccion.
- El ajuste fino puede haber reducido el rendimiento en tareas generales o en idiomas distintos del ruso respecto al modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen2.5 y del dataset GrandMaster-PRO-MAX antes de un uso comercial.
- La model card incluye un aviso explicito de evaluar el modelo antes de usarlo; no se proporcionan datos de evaluacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Vikhr-Qwen-2.5-1.5B-Instruct-GGUF
- Modelo base del ajuste fino: https://huggingface.co/Vikhrmodels/Vikhr-Qwen-2.5-1.5B-Instruct
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
