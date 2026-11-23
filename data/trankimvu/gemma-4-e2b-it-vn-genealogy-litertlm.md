# trankimvu/gemma-4-E2B-it-vn-genealogy-litertlm

## Resumen

Gemma 4 E2B IT Vietnamese Genealogy Assistant es un ajuste fino del modelo base `google/gemma-4-E2B-it` de Google, especializado en preguntas y respuestas sobre genealogía vietnamita. Lo desarrolla el usuario de Hugging Face `trankimvu` y se distribuye en formato LiteRT-LM, el runtime de Google para inferencia en dispositivo (Android y macOS), lo que lo aleja del ecosistema habitual de safetensors/GGUF y lo orienta a despliegue local en hardware de consumo.

El modelo parte de la familia Gemma 4 en su variante E2B (orientada a eficiencia en dispositivo) y se ha adaptado mediante LoRA sobre las 35 capas de atención del decodificador de texto, con un conjunto sintético y anonimizado de 520 pares de instrucción-respuesta sobre genealogía vietnamita. El resultado se fusiona sin pérdida en los pesos base y se exporta como bundle `.litertlm` de solo texto con cuantización de 4 bits en bloque.

Su relevancia es doble: por un lado demuestra el flujo completo de ajuste fino y empaquetado para LiteRT-LM con un caso de dominio muy concreto; por otro, cubre un nicho lingüístico y cultural (genealogía en vietnamita) poco representado en los modelos generalistas. El repositorio ocupa 2,7 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B), ajuste fino LoRA sobre 35 capas de atencion del decodificador de texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (`cache_length=2048` en el bundle LiteRT-LM) |
| Tipos de cuantizacion | `dynamic_wi4b32_afp32` (pesos 4 bits en bloque de 32, activaciones FP32); embedders externalizados a 4 bits |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, solo texto); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4, en la variante E2B orientada a inferencia en dispositivo. El ajuste fino se realizó con LoRA de rango 16 y alpha 32 aplicado a las 35 capas de atención del decodificador de texto, sobre un conjunto de 520 pares SFT sintéticos y completamente anonimizados de genealogía vietnamita, sin PII real. Los adaptadores se fusionaron de forma lossless en los pesos base.

La exportación se realizó a LiteRT-LM 0.19.1 o superior, generando un bundle `.litertlm` de solo texto con cuantización dinámica de pesos a 4 bits en bloques de 32 y activaciones FP32, con los embedders externalizados también a 4 bits y una longitud de caché de 2048 tokens. El autor declara verificación local en `litert-lm==0.19.1` sobre GPU y CPU, con 0 % de saludos genéricos (boilerplate greetings) y 0 % de truncamiento de listas en los prompts de evaluación reservados.

## Capacidades

- Generación de texto y respuesta a preguntas en vietnamita sobre genealogía: interpretación de relaciones familiares, linajes y terminología genealógica.
- Respuestas concisas y ancladas al contexto (grounded), según la evaluación del autor sobre prompts reservados.
- Formato de salida en listas sin truncamiento observado en la evaluación local.
- Inferencia en dispositivo (on-device) en Android y macOS mediante LiteRT-LM 0.19.1 o superior.
- Ejecución tanto en GPU como en CPU del dispositivo, según la verificación del autor.
- Modelo de solo texto: no se declaran capacidades de visión, audio ni tool calling.
- Capacidades multilingües: no disponibles; el modelo está orientado exclusivamente a vietnamita.

## Casos de uso

- Aplicación móvil de consulta genealógica familiar: integrada en una app Android mediante LiteRT-LM, el modelo responde preguntas sobre parentescos y terminología de linajes sin conexión a red, gracias a su formato on-device y a la ventana de 2048 tokens.
- Asistente offline en macOS para investigadores de historia familiar: permite consultar definiciones y relaciones genealógicas vietnamitas en local, sin enviar datos personales a servidores externos.
- Digitalización de archivos familiares: uso como capa de interpretación de términos y estructuras de parentesco extraídas de documentos históricos vietnamitas, con respuestas concisas adecuadas para revisión humana.
- Educación y divulgación cultural: respuestas guiadas sobre convenciones de nombres y linajes vietnamitas en contextos museísticos o patrimoniales, con despliegue en dispositivos de bajo consumo.
- Prototipado de asistentes de nicho en LiteRT-LM: sirve como referencia reproducible del flujo LoRA + fusión + exportación `.litertlm` para equipos que quieran adaptar Gemma 4 E2B a un dominio concreto.
- Evaluación de despliegue en dispositivo: banco de pruebas para medir latencia y comportamiento de un bundle de 4 bits en GPU y CPU de móviles y portátiles macOS dentro de una app real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas cualitativas de su evaluación local (0 % de saludos genéricos y 0 % de truncamiento de listas en prompts reservados), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- Tamaño del repositorio: 2,7 GB, correspondiente al bundle `.litertlm` cuantizado a 4 bits.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño del bundle y la cuantización de 4 bits, el modelo está pensado para ejecutarse en memoria unificada de dispositivos móviles y portátiles, no en GPUs de centro de datos.
- GPU recomendadas: no se especifican modelos concretos; el autor verifica ejecución en GPU y CPU de dispositivo mediante LiteRT-LM.
- Compatibilidad con GPU de consumo: no confirmada para RTX 4090, A100 o H100; el runtime objetivo es LiteRT-LM en Android y macOS, no CUDA.
- Opciones de despliegue: LiteRT-LM 0.19.1 o superior exclusivamente; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma-4-E2B-it-vn-genealogy-litertlm | no disponible | 2048 | `.litertlm` 4 bits | Apache 2.0 | Genealogía vietnamita on-device |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | safetensors y otros | licencia Gemma (no confirmada en esta ficha) | Propósito general, multilingüe |
| Alternativas de ajuste fino en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado con solo 520 pares sintéticos de genealogía vietnamita; el rendimiento fuera de ese dominio no está evaluado.
- Dataset sintético: al no usar datos reales, pueden existir discrepancias con convenciones genealógicas reales o regionales.
- Contexto limitado a 2048 tokens, insuficiente para documentos genealógicos extensos o conversaciones muy largas.
- Solo vietnamita: no se declara soporte para otros idiomas, incluido el español.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en datos históricos y de parentesco donde la verificación factual es crítica.
- Sin datos publicados sobre sesgos; al ser un ajuste de Gemma 4, puede heredar sesgos del modelo base.
- Formato propietario de runtime (`.litertlm`): no es portable a vLLM, llama.cpp u otros motores habituales, lo que limita su integración en infraestructura de servidor.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma tiene sus propios términos; conviene verificar la compatibilidad para uso comercial.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trankimvu/gemma-4-E2B-it-vn-genealogy-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Runtime LiteRT-LM: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
