# vvennelakanti/samgo-glimmer-lora-r11

## Resumen

SAMgo Glimmer (run 11) es un adaptador LoRA de tipo PEFT sobre el modelo base Muse Glimmer 30B, desarrollado por el usuario vvennelakanti en el contexto del Meta Global AI Developer Hackathon (octubre-noviembre de 2026). Su funcion no es la generacion de texto general, sino una tarea muy acotada: dado un modelo LEGO descrito como lista numerada de piezas (studs en x/y, placas en z) y una instruccion generica en lenguaje natural ("anade el tren de rodaje", "el borde de una estructura plana debe abrirse", "coloca un rotor en esta cara"), el modelo devuelve una lista de ediciones en JSON con las operaciones `clear`, `remove`, `set` y `add` necesarias para construir un mecanismo funcional.

El adaptador forma parte del sistema SAMgo, donde un modelo distinto (Muse Spark) decide que debe moverse y donde, mientras que este LoRA decide como construirlo con piezas LEGO reales. Cada respuesta se verifica mediante un checker programatico que comprueba que solo se usan piezas existentes, que no hay solapamientos, que cada pieza queda sujeta por studs, que el mecanismo gira o se abre sin colisionar y que el modelo se sostiene. Si el checker rechaza la respuesta, el modelo recibe su feedback exacto y dispone de hasta tres rondas de correccion.

El interes de esta ficha es doble: por un lado, documenta un caso de uso muy especializado de fine-tuning con LoRA (rank 32, alpha 32, BF16) sobre proyecciones q/k/v/o y MLP; por otro, ilustra un patron de entrenamiento con datos sinteticos generados y verificados por el propio checker del sistema, incluyendo filas de tipo error-feedback-correccion. La informacion publica disponible es limitada y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Muse Glimmer 30B); rango 32, alpha 32, aplicado a q/k/v/o y proyecciones MLP |
| Parametros totales | No disponible para el adaptador (el modelo base es de 30B; el repositorio del adaptador ocupa 0,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso secuencias de hasta 24.576 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y publica en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 en precision BF16, inyectado en las proyecciones de atencion q/k/v/o y en las proyecciones del bloque MLP del modelo base Muse Glimmer 30B, un transformer decoder-only de 30.000 millones de parametros. El entrenamiento se realizo con SFT serverless en Fireworks, con batch de 64, 2 epocas y longitud maxima de secuencia de 24.576 tokens. El conjunto de datos, publicado como `vvennelakanti/samgo-glimmer-train-r11`, contiene 15.680 filas generadas y verificadas por el checker de SAMgo, sin nombres de objetos: cuerpos genericos (bloques, paneles, tapas, aletas, estanterias, carrocerias tipo coche) combinados con habilidades genericas (tren de rodaje, bisagra de una tira o del borde de una lamina, pata con rueda, rotor lateral, rotor vertical sobre plato giratorio).

Aproximadamente la mitad de las filas de habilidad siguen el esquema error -> feedback del checker -> correccion, e incluyen errores cometidos por versiones anteriores del propio modelo. Los aviones, helicopteros, ventiladores y turbinas se excluyeron deliberadamente del entrenamiento y se reservaron como examenes de generalizacion. La innovacion tecnica principal no esta en la arquitectura, sino en el bucle de entrenamiento e inferencia: el modelo aprende a interpretar el feedback estructurado de un verificador simbolico y a producir ediciones que lo satisfagan, con hasta tres rondas de reparacion.

## Capacidades

- Generacion de listas de ediciones JSON (`clear`, `remove`, `set`, `add`) sobre una representacion de piezas LEGO con coordenadas de studs en x/y y placas en z.
- Razonamiento espacial y mecanico acotado: colocacion de ladrillos Technic y ejes para ruedas, placas de bisagra para puertas y solapas, ejes y cruces de palas para rotores, platos giratorios para rotores verticales.
- Interpretacion de instrucciones genericas en lenguaje natural y traduccion a una secuencia de construccion concreta.
- Autocorreccion guiada por feedback: consume el mensaje exacto del checker (por ejemplo, "la pieza de entrada 86 solapa tu bar plate: eliminada primero" o "este clip no sujeta nada") y repara la respuesta en hasta tres rondas.
- Cumplimiento de restricciones fisicas verificables: uso exclusivo de piezas reales, ausencia de solapamientos, sujecion por studs, movimiento libre del mecanismo y estabilidad del modelo.
- No se documentan capacidades de tool calling general, agentes multi-paso fuera del bucle de checker, vision, audio ni modo thinking.

## Casos de uso

- Generacion automatica de instrucciones de construccion LEGO: a partir de una foto procesada por el pipeline de SAMgo, el adaptador produce la lista de ediciones que convierte una descripcion de maquina en un modelo construible con mecanismos funcionales.
- Prototipado de mecanismos en diseno asistido: permite explorar rapidamente como anclar una rueda, una bisagra o un rotor sobre un cuerpo dado, usando piezas Technic estandar y verificando que el movimiento no colisiona.
- Juguetes y productos de construccion personalizados: un fabricante podria integrar el modelo en una herramienta que traduzca bocetos de clientes en listas de piezas y pasos de montaje validados por el checker.
- Educacion STEM y robotica: genera ejercicios de construccion con mecanismos (trenes de rodaje, bisagras, rotores) que el alumnado debe montar y verificar fisicamente.
- Investigacion en generacion estructurada con verificacion: sirve como caso de estudio de entrenamiento con datos sinteticos verificados y de inferencia con bucle de reparacion basado en feedback simbolico.
- Benchmark de generalizacion composicional: los conjuntos reservados (aviones, helicopteros, ventiladores, turbinas) permiten evaluar si el modelo extrapola habilidades mecanicas a categorias de objetos nunca vistas.
- Integracion en pipelines de validacion automatica de disenos: el adaptador puede actuar como generador de candidatos que un verificador posterior filtra, reduciendo el coste de exploracion manual.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de test congelados y nunca vistos en entrenamiento. Se indica el resultado al primer intento y, cuando procede, el resultado dentro de tres rondas de feedback.

| Test (cuerpos no vistos) | Run 11 |
|---|---|
| Rotor lateral insertado en una cara, gira 360 grados libre (30) | 28 |
| Rotor vertical: palas sobre plato giratorio, giro 360 grados libre (30) | 19 / 24 |
| Bisagra en el borde de una lamina plana (30) | 14 / 20 |
| Bisagra de una tira sobre un bloque (20) | 14 / 15 |
| Anadir una pata con rueda (20) | 20 |
| Tren de rodaje de coche, coches reservados (50) | 48 / 50 |
| Bisagras de puerta en vehiculos no vistos (10) | 10 |
| Objetos: colocar o reparar un mecanismo (112) | 92 |

Para contextualizar la progresion del proyecto, la model card indica que ejecuciones anteriores obtuvieron 0 de 10 en el test de bisagras de puerta (run 4) y 0 de 20 en bisagras de tira (run 5), frente a 10/10 y 15/20 en el run 11. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB, pero requiere cargar el modelo base Muse Glimmer 30B para inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 60 GB de pesos, mas memoria para el contexto; en cuantizacion de 8 bits rondaria los 30 GB y en 4 bits unos 15-18 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; configuraciones multi-GPU con `device_map="auto"`; en consumer GPU solo es viable con cuantizacion agresiva del modelo base (por ejemplo, RTX 4090 de 24 GB en 4 bits, con margen limitado).
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles. La longitud de secuencia de entrenamiento (hasta 24.576 tokens) sugiere prompts largos con listas de piezas extensas, lo que incrementa el coste de atencion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para generacion de estructuras LEGO verificadas). Se ofrece una comparacion con el modelo base y con la alternativa generica de uso.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMgo Glimmer LoRA r11 | Adaptador sobre 30B | Hasta 24.576 tokens en entrenamiento | Ediciones JSON para mecanismos LEGO | No disponible | Hugging Face, 0 descargas |
| Muse Glimmer 30B (base) | 30B | No disponible | Generacion de texto general | No disponible | Referenciado como `meta-models/Muse-Glimmer-30B` |
| Modelo generalista sin fine-tuning | Variable | Variable | Texto general, sin verificacion mecanica | Variable | Amplia |

## Limitaciones y advertencias

- Ambito extremadamente estrecho: el modelo solo produce listas de ediciones sobre el formato de piezas de SAMgo y no es util para generacion de texto, codigo o conversacion general.
- Dependencia total del checker: sin el verificador de SAMgo, las respuestas pueden contener solapamientos, piezas no sujetas o mecanismos que no giran; el bucle de feedback es parte esencial del rendimiento reportado.
- Generalizacion limitada a las habilidades entrenadas: aviones, helicopteros, ventiladores y turbinas nunca estuvieron en los datos y solo se usaron como examenes; el rendimiento en categorias fuera de la distribucion puede degradarse.
- Resultados modestos en algunas habilidades: bisagras en el borde de laminas planas alcanzan 14/30 al primer intento y 20/30 con feedback; rotores verticales, 19/30 y 24/30.
- Riesgo de alucinacion estructural: el modelo puede proponer piezas o identificadores inexistentes, aunque el checker los rechace en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; el dominio es acotado y los datos son sinteticos, generados por el propio sistema.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; es imprescindible verificar la licencia de Muse Glimmer 30B antes de cualquier despliegue.
- Idiomas: no se documenta soporte multilingue; las instrucciones de entrenamiento parecen estar en ingles.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; sin pipeline declarado ni mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vvennelakanti/samgo-glimmer-lora-r11
- Dataset de entrenamiento: https://huggingface.co/datasets/vvennelakanti/samgo-glimmer-train-r11
- Repositorio SAMgo: https://github.com/vvennela/samgo
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Meta Global AI Developer Hackathon: no disponible (no se proporciona URL en la informacion)
