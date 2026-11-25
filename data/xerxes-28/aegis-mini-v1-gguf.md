# Xerxes-28/AEGIS-Mini-V1-GGUF

## Resumen

AEGIS-Mini-V1 es un ajuste fino (SFT) del modelo Qwen3-4B orientado a dominios tecnicos concretos: electronica, drones, robotica, matematicas y fisica. Lo desarrolla el autor independiente Xerxes-28 y se distribuye en este repositorio unicamente como archivo GGUF cuantizado en Q4_K_M (unos 2,5 GB), pensado para ejecutarse en telefonos, portatiles y servidores pequenos mediante llama.cpp, Ollama, LM Studio o PocketPal. El adaptador LoRA original se publica por separado.

El modelo parte de `unsloth/Qwen3-4B-unsloth-bnb-4bit`, una copia en 4 bits de Qwen3-4B, y conserva la licencia Apache-2.0 del modelo base. Cuenta con aproximadamente 4.022 millones de parametros, es un transformer causal decoder-only y esta entrenado exclusivamente en ingles. La longitud de contexto usada durante el entrenamiento fue de 2.048 tokens, muy por debajo de la ventana nativa de Qwen3.

Su relevancia practica es la de un modelo pequeno y ligero que cabe en dispositivos de gama baja y funciona sin conexion, especializado en explicaciones teoricas de ingenieria. El autor advierte explicitamente de que no se ha evaluado con benchmarks publicos y de que no debe usarse para decisiones de seguridad critica ni para valores finales de diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento; contexto nativo del modelo base no disponible en la informacion) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye pesos, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre Qwen3-4B, un transformer decoder-only de aproximadamente 4.000 millones de parametros. El entrenamiento se realizo con Unsloth sobre la version cuantizada en 4 bits del modelo base (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) y se distribuye como adaptador LoRA en un repositorio aparte (`Xerxes-28/AEGIS-Mini-V1-LoRA`); este repositorio contiene solo la fusion cuantizada a GGUF en Q4_K_M.

Los datos de entrenamiento son pares de pregunta y respuesta sobre electronica, drones, robotica, matematicas y fisica, con predominio de contenido teorico. Las fuentes citadas en las etiquetas del repositorio incluyen `HuggingFaceH4/MATH-500` y `mrohith29/high-school-physics`. El contexto de entrenamiento fue de 2.048 tokens. No se documenta en la informacion disponible el volumen de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO adicionales. Las referencias arXiv en las etiquetas (2505.09388, 2103.03874, 2305.20050, 2106.09685, 2305.14314, 2110.02861, 1711.05101, 1608.03983) corresponden a trabajos de metodologia (entre ellos LoRA, QLoRA, AdamW y normalizacion por capas), no a resultados propios del modelo.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (el GGUF incluye el chat template).
- Explicacion de conceptos de electronica: ley de Ohm, filtros, polarizacion de transistores.
- Explicacion de conceptos de drones y robotica: control PID, fusion de sensores.
- Calculo paso a paso en matematicas y fisica de nivel preuniversitario y universitario basico.
- Generacion de borradores de respuesta que el usuario debe verificar.
- Uso sin conexion en dispositivos locales (telefono, portatil, servidor pequeno).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Estudio sin conexion en el movil: con PocketPal y el archivo Q4_K_M de 2,5 GB, un estudiante puede consultar explicaciones de ley de Ohm o filtros RC sin red, en un telefono con al menos 4 GB de almacenamiento libre.
- Tutor de fisica de bachillerato: el modelo resuelve ejercicios paso a paso (cinematica, circuitos, energia) y sirve como primer borrador que el alumno contrasta con el libro de texto.
- Apoyo a aficionados a la robotica: explicacion conceptual de lazos PID y fusion de sensores para entender la teoria antes de ajustar un controlador real en banco de pruebas.
- Asistente de documentacion interna para equipos de hardware: generar explicaciones introductorias de conceptos de electronica que luego un ingeniero revisa y publica en una wiki.
- Prototipado rapido de un chatbot de dominio en local: desplegado con Ollama o llama.cpp en un portatil, permite validar la experiencia de chat tecnico antes de invertir en un modelo mayor.
- Formacion interna en empresas de drones: generar material didactico teorico sobre estabilidad y control que los formadores validan antes de su uso.
- Borrador de respuestas para foros tecnicos: el modelo redacta una primera explicacion que el usuario revisa y corrige antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ejecuto benchmarks publicos y remite a las secciones de resultados y limitaciones de la model card antes de usar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (el archivo pesa unos 2,5 GB; se necesita margen para el contexto y el runtime).
- Almacenamiento: al menos 4 GB libres en el dispositivo, segun las instrucciones del autor para movil.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder cargarlo; el autor no publica una lista de GPU verificadas.
- Cabe en GPU consumer: si, previsiblemente en modelos con 4 GB o mas de VRAM; no confirmado por el autor.
- Movil: soportado via PocketPal con al menos 4 GB de almacenamiento libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y PocketPal (los cuatro citados por el autor).
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AEGIS-Mini-V1 (este) | ~4B | 2.048 tokens (entrenamiento) | Apache-2.0 | GGUF Q4_K_M en HF | SFT de dominio en ingles; sin benchmarks publicos |
| Qwen3-4B (base) | ~4B | no disponible en la informacion | Apache-2.0 | Pesos completos y multiples cuantizaciones | Modelo generalista multilingue del que deriva |
| Alternativas de ~4B especializadas en STEM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria; los unicos datos verificables son los del modelo base Qwen3-4B.

## Limitaciones y advertencias

- El autor no publico benchmarks; el rendimiento real en tareas de dominio no esta cuantificado.
- Riesgo alto de alucinacion en valores numericos: el modelo puede dar una cifra incorrecta con tono seguro. El autor prohibe su uso como unica fuente para calculos de seguridad.
- No debe usarse para decisiones de seguridad critica, valores finales de diseno de circuitos, baterias o aeronaves, ni para consejo medico, legal o financiero.
- No es fiable para datos exactos de hojas de datos (direcciones de registro, numeros de pin).
- Entrenado solo en ingles; no se documenta soporte de castellano ni de otros idiomas.
- Contexto de entrenamiento de solo 2.048 tokens, lo que limita conversaciones largas y documentos extensos.
- Entrenamiento predominantemente teorico: puede fallar en tareas practicas de ingenieria o en datos empiricos.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias de seguridad del autor siguen siendo aplicables en produccion.
- No se documenta soporte de tool calling ni de agentes; no conviene asumirlo en pipelines automatizados.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-GGUF
- Adaptador LoRA: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-LoRA
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de fisica de bachillerato: https://huggingface.co/datasets/mrohith29/high-school-physics
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper de decodificacion especulativa (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper de atencion (arXiv:2103.03874): https://arxiv.org/abs/2103.03874
- Paper de inicializacion (arXiv:2110.02861): https://arxiv.org/abs/2110.02861
- Paper AdamW (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper de normalizacion por capas (arXiv:1608.03983): https://arxiv.org/abs/1608.03983
