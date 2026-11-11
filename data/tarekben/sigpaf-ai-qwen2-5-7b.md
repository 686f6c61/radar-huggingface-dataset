# tarekben/sigpaf-ai-qwen2.5-7b

## Resumen

SIGPAF-AI es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario tarekben, orientado a cubrir las necesidades pedagogicas, administrativas, financieras y de seguridad laboral del sistema de formacion profesional de Argelia. El modelo se distribuye como un adaptador PEFT (LoRA/QLoRA) sobre el modelo base, no como pesos completos, y esta especializado en normativa argelina: decretos, leyes de contabilidad publica, gestion de recursos humanos del sector educativo y protocolos HSE en talleres de formacion.

La relevancia del modelo es acotada pero clara: cubre un nicho regulatorio muy especifico (MFEP, INFEP, SIGPAF, normativa LOLF, decretos 09-93, 14-140, 24-74, ley 88-07, entre otros) que los modelos generalistas no dominan con precision. El ajuste se realizo con QLoRA de 4 bits mediante la libreria Unsloth sobre 19.237 pares de entrenamiento segun declara el autor. El modelo esta pensado para consultas en arabe y frances, los dos idiomas oficiales del contexto argelino.

Al tratarse de un adaptador sobre Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only del modelo base, con 7.000 millones de parametros y una ventana de contexto de 128.000 tokens (segun las especificaciones oficiales de Qwen2.5-7B-Instruct). El repositorio ocupa 0,7 GB, coherente con el tamano de un adaptador LoRA y no con pesos completos en precision alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); ajuste mediante adaptador PEFT (LoRA/QLoRA 4-bit) |
| Parametros totales | 7.000 millones (modelo base); el adaptador anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible explicitamente; el entrenamiento uso QLoRA 4-bit; el adaptador PEFT es compatible con cuantizacion del modelo base (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | arabe (ar), frances (fr); el modelo base soporta ademas ingles y otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base Qwen/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros con atencion por ventanas deslizantes y RoPE, disenado por Alibaba Qwen. El adaptador se entreno con QLoRA de 4 bits usando la libreria Unsloth, tecnica que reduce el uso de memoria y acelera el ajuste fino sobre GPUs de consumo. El autor declara 19.237 pares de entrenamiento "de alta precision y 100% unicos (Zero Duplicates)", lo que sugiere un proceso de deduplicacion previo. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

La innovacion principal no es arquitectonica sino de dominio: el dataset cubre seis pilares tematicos (pedagogia y diseno curricular, gestion administrativa y RRHH, gestion financiera y contable, orientacion e insercion laboral, seguridad y salud en el trabajo, y normativa legal argelina). El autor cita como fuentes el manual de gestion pedagogica de Omar Wartilani (edicion septiembre de 2026), los curriculos nacionales INFEP/MFEP y un conjunto de leyes y decretos argelinos. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido mas alla de lo que ya ofrece el modelo base.

## Capacidades

- Generacion de texto conversacional en arabe y frances, con especializacion en terminologia administrativa y regulatoria argelina.
- Generacion de examenes oficiales con escalas de calificacion sobre 20, encabezados ministeriales y situaciones de integracion profesional (MSP), segun los ejemplos de la model card.
- Elaboracion de horarios semanales de 32 horas con distribucion entre aulas, talleres y laboratorios.
- Redaccion de fichas de enfoque por competencias (APC) con criterios de desempeno y umbral de exito del 80%.
- Consultas sobre carrera profesional y retribucion de profesores (PEP, PSEP 1, PSEP 2, MSEP), inspectores y directores de centros CFPA/INSFP.
- Calculo y explicacion de tramos de promocion por grado, examenes profesionales y listas de habilitacion.
- Gestion financiera publica: fases de ejecucion del gasto (compromiso, liquidacion, ordenacion y pago), separacion entre ordenador de pagos y contable publico, derecho de requisicion.
- Presupuestos por programas y objetivos con indicadores KPI bajo la ley organica 23-07 (LOLF).
- Gestion de comedores y residencias: calculo del PJA (prix du jour alimentaire) y conservacion de muestras testigo 72 horas.
- Contratacion publica bajo el decreto 15-247, con umbral de 12 millones de dinares y comisiones de evaluacion (COP/CEO).
- Seguridad y salud laboral: ley 88-07, comites CHS, equipos de proteccion individual (EPI), procedimientos de consignacion LOTO, lucha contra incendios y simulacros de evacuacion.
- Orientacion e insercion: campanas de inscripcion en la plataforma Takwine, pruebas de seleccion, pasarelas (decreto 129) y coordinacion con ANEM.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-7B-Instruct.
- Capacidad multilingue limitada al par arabe-frances para el dominio especializado; el modelo base conserva capacidades adicionales en ingles y otros idiomas.

## Casos de uso

- **Generacion de examenes de formacion profesional**: el modelo produce enunciados completos con encabezado oficial, situacion de integracion profesional y escala de calificacion sobre 20 para asignaturas como bases de datos en la especialidad de desarrollo web. Es adecuado porque el dataset incluye ejemplos estructurados de examenes oficiales argelinos.
- **Consultas de RRHH docente**: un profesor o administrador puede preguntar por los requisitos y procedimientos de promocion de rango segun el decreto 09-93 modificado por el 14-140. El modelo responde con la terminologia exacta y los plazos legales (5 anos para examen profesional, 10 para listas de habilitacion).
- **Asistencia en gestion economica de centros**: calculo del PJA, conservacion de muestras testigo y gestion de residencias y comedores escolares. Util para intendentes y contables de institutos de formacion.
- **Cumplimiento normativo en talleres**: consultas sobre protocolos de seguridad (EPI, LOTO, extintores, evacuacion) conforme a la ley 88-07. Apropiado para responsables HSE que necesitan referencias normativas rapidas.
- **Redaccion de pliegos y evaluacion de ofertas**: apoyo en la elaboracion de consultas publicas bajo el decreto 15-247, con umbrales y comisiones de evaluacion. Util para servicios de contratacion de centros de formacion.
- **Orientacion e insercion laboral**: guionizacion de entrevistas de orientacion, explicacion de pasarelas y coordinacion con ANEM y dispositivos de emprendimiento (NESDA, ANGEM, CDE). Adecuado para consejeros COPE.
- **Formacion interna y onboarding**: generacion de material de consulta para nuevos administrativos sobre procedimientos internos, normativa de ausencias y regimen disciplinario (decisiones 123-2023, 197-198-199 de 2023).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia**: al ser un adaptador sobre Qwen2.5-7B-Instruct, los requisitos son los del modelo base. En FP16 se estiman aproximadamente 14-16 GB de VRAM; en cuantizacion 8-bit unos 8-9 GB; en 4-bit (GGUF Q4_K_M o AWQ) alrededor de 4,5-5,5 GB.
- **GPU recomendadas**: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) para FP16 en un solo usuario o 8-bit con batching moderado; RTX 3090/4080 (16-24 GB) para 8-bit; RTX 3060 12 GB o superior para 4-bit.
- **GPU de consumo**: si, cabe en GPUs de consumo con cuantizacion 4-bit (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En CPU es viable con llama.cpp y cuantizacion Q4, aunque con latencia alta.
- **Opciones de despliegue**: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp, Ollama, LM Studio y el stack de Unsloth para carga del adaptador. Requiere fusionar el adaptador con el modelo base o cargarlo como PEFT sobre Qwen2.5-7B-Instruct.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Como referencia del modelo base, en una A100 con vLLM se suele obtener un throughput del orden de miles de tokens por segundo con batching, pero no hay datos especificos publicados para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| SIGPAF-AI (tarekben/sigpaf-ai-qwen2.5-7b) | 7B (adaptador PEFT) | 128k (heredado) | no disponible | Formacion profesional argelina (MFEP/INFEP/SIGPAF) | Hugging Face, 85 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 (modelo base) | Generalista, multilingue | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | Generalista | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Generalista | Hugging Face |

La comparativa directa es dificil porque SIGPAF-AI no publica benchmarks y su licencia no esta declarada. Frente a los generalistas, su ventaja es la cobertura normativa argelina; su desventaja es el alcance limitado a ese dominio y la dependencia del modelo base para capacidades generales.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica la licencia del adaptador ni del modelo resultante. Esto impide confirmar si el uso comercial esta permitido; hay que contactar con el autor o asumir los terminos del modelo base (Apache 2.0 para Qwen2.5-7B-Instruct) y verificar la compatibilidad.
- **Dependencia del modelo base**: el adaptador no funciona de forma autonoma; requiere cargar Qwen/Qwen2.5-7B-Instruct y aplicar el PEFT. El repositorio de 0,7 GB no contiene pesos completos.
- **Riesgo de alucinacion normativa**: al estar especializado en legislacion concreta (decretos, leyes, fechas), existe riesgo de que el modelo cite articulos, fechas o umbrales incorrectos. En produccion conviene validar las respuestas contra fuentes oficiales.
- **Cobertura limitada a dos idiomas**: el ajuste se declara en arabe y frances; el rendimiento en castellano u otros idiomas no esta garantizado para el dominio especializado.
- **Dataset no auditable**: el autor declara 19.237 pares unicos, pero no se publica la composicion detallada ni la metodologia de evaluacion. No hay benchmarks que respalden la calidad.
- **Sesgos potenciales**: al entrenarse sobre normativa y manuales de una jurisdiccion concreta, el modelo puede reproducir sesgos institucionales o interpretaciones administrativas no neutrales.
- **Fecha de creacion futura**: la model card indica creacion en octubre de 2026, lo que puede indicar metadatos erroneous o un contexto temporal no verificado; conviene tratarlo con cautela.
- **Uso en produccion**: sin benchmarks ni licencia clara, no se recomienda desplegarlo en entornos criticos sin una evaluacion previa y una revision legal de los terminos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarekben/sigpaf-ai-qwen2.5-7b
- Dataset asociado: https://huggingface.co/datasets/tarekben/sigpaf-algeria-vocational-training
- Notebook de fine-tuning en Colab: https://colab.research.google.com/github/tarekben96/training-platform/blob/main/SIGPAF_AI_Colab_FineTuning.ipynb
- Repositorio de la plataforma de entrenamiento: https://github.com/tarekben96/training-platform
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
