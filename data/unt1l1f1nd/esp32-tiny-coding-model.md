# Unt1l1f1nd/esp32-tiny-coding-model

## Resumen

esp32-tiny-coding-model es un modelo de generacion de codigo extremadamente pequeno (2,9 millones de parametros en el nucleo, mas una tabla de consulta de 0,8 millones) desarrollado por Unt1l1f1nd y publicado bajo licencia MIT. Su proposito es generar programas en un lenguaje tipo Python muy reducido (`clear`, `text`, `pixel`, `line`, `rect`, `fill`, `circle`, `wait`, variables, `for`, `while`, `if`) a partir de instrucciones en ingles, y ejecutarlos directamente en un microcontrolador ESP32-S3 con pantalla OLED SSD1306 de 128x64 pixeles, sin conexion a internet ni servidor.

El modelo ocupa 2,1 MB en cuantizacion de 4 bits y se ejecuta en el propio chip a unos 9 tokens por segundo. Segun la model card, alcanza un 98% de acierto en peticiones no vistas (held-out) dibujando la misma imagen que la referencia. La relevancia actual radica en que demuestra inferencia de un modelo generativo de codigo completamente en el borde (edge), dentro de las restricciones de memoria y computo de un microcontrolador de bajo coste.

El proyecto incluye el firmware, el interprete en C, el generador de datos de entrenamiento y el runtime, todo disponible en un repositorio de GitHub fork de slvDev/esp32-ai. No se especifican datos de arquitectura interna, contexto ni idiomas soportados mas alla del ingles de las peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de generacion de codigo, detalles no publicados) |
| Parametros totales | 2,9 M nucleo + 0,8 M tabla de consulta (Per-Layer Embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (2,1 MB en flash) |
| Idiomas soportados | ingles (peticiones); idiomas adicionales no disponibles |
| Licencia | MIT |
| Formato de pesos | binario propietario (`model.bin`) para el firmware; tokenizer en `tokenizer.json` (byte-level BPE, 1.079 tokens) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del transformer (numero de capas, dimensiones, mecanismo de atencion). Se sabe que emplea una tecnica de Per-Layer Embeddings: una tabla de consulta de 0,8 M parametros adicionales al nucleo de 2,9 M, lo que sugiere una estrategia de compresion o factorizacion para reducir el coste de inferencia en el dispositivo. El modelo se ejecuta en 4 bits (2,1 MB) dentro de la flash del ESP32-S3.

El entrenamiento se realizo con aproximadamente 300.000 pares peticion-programa generados por reglas (sin intervencion de otro modelo), y cada programa fue validado ejecutandolo con el interprete de referencia antes de conservarlo. El generador de datos es reproducible mediante `research/oled/gen.py` en el repositorio. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales. La innovacion principal es la co-diseno de modelo, interprete y firmware para que el chip mantenga el control: el interprete impone limites de pasos y de espera, de modo que cualquier programa generado queda acotado en ejecucion.

## Capacidades

- Generacion de codigo en un lenguaje DSL tipo Python reducido con instrucciones de dibujo (`clear`, `text`, `pixel`, `line`, `rect`, `fill`, `circle`, `wait`) y control de flujo (`for`, `while`, `if`, variables).
- Traduccion de instrucciones en ingles a programas ejecutables en la pantalla OLED 128x64.
- Ejecucion local en el microcontrolador mediante interprete en C con limites de pasos y espera.
- Inferencia sin conexion (offline) a unos 9 tokens/s en el ESP32-S3.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles de las peticiones de entrenamiento; peticiones alejadas del estilo entrenado pueden producir dibujos incorrectos.

## Casos de uso

- Demostracion educativa de TinyML generativo: el modelo permite mostrar en un aula como un modelo de lenguaje genera y ejecuta codigo dentro de un microcontrolador de bajo coste, sin infraestructura de servidor.
- Prototipado de interfaces de voz/texto en dispositivos embebidos: se puede integrar como capa de generacion de instrucciones graficas para pantallas OLED en proyectos de domotica o wearables.
- Generacion de visualizaciones simples en pantalla: peticiones como "draw a house" o "countdown from 5 then happy birthday" producen programas que dibujan formas y texto en la OLED de 128x64.
- Pruebas de concepto de inferencia en el borde: util para investigadores que estudian latencia, consumo y viabilidad de modelos generativos en MCU con 8 MB de PSRAM y 16 MB de flash.
- Automatizacion de animaciones y secuencias: el DSL incluye `wait`, `for` y `while`, lo que permite generar animaciones sencillas (por ejemplo, "bounce a ball twice quickly") ejecutadas localmente.
- Base para experimentos de compresion y cuantizacion: el uso de Per-Layer Embeddings y 4 bits sirve como referencia para investigar tecnicas de reduccion de modelos en dispositivos con restricciones severas de memoria.
- Sustituto de scripts predefinidos en firmware: en lugar de codificar a mano cada pantalla, el dispositivo puede generar el programa a partir de una frase en ingles, reduciendo el tamano del firmware.

## Benchmarks y rendimiento

La model card reporta un 98% de coincidencia con la imagen de referencia en peticiones no vistas (held-out). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Peticiones held-out con dibujo identico a la referencia | 98% |
| Velocidad de inferencia en ESP32-S3 | ~9 tokens/s |
| Tiempo para "draw a house" | 5,6 s |
| Tamano del modelo en 4 bits | 2,1 MB |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en un ESP32-S3 con 16 MB de flash y 8 MB de PSRAM (octal), ocupando 2,1 MB en flash.
- GPU recomendadas: no aplica; no se requiere GPU para inferencia en el dispositivo. Para reentrenamiento o generacion de datos no se especifican requisitos.
- Cabe en consumer GPU: no aplica; el destino es un microcontrolador, no una GPU.
- Opciones de despliegue: firmware propietario del repositorio (`esp32-oled-full.bin` o `model.bin` en offset `0x110000`), flasheado con `esptool`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 9 tokens/s en el ESP32-S3; 5,6 s para generar el programa de "draw a house".
- Hardware adicional: pantalla OLED SSD1306 I2C 128x64 con SDA = GPIO 18 y SCL = GPIO 8; puerto serie a 115200 baud para enviar peticiones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de generacion de codigo disenados para ejecutarse en un ESP32-S3 con caracteristicas equivalentes (2,9 M parametros, 2,1 MB en 4 bits, DSL de dibujo e interprete en el chip).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| esp32-tiny-coding-model | 2,9 M + 0,8 M | no disponible | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo comprende peticiones en el estilo y dominio con el que fue entrenado; frases alejadas de ese estilo pueden generar dibujos incorrectos.
- El lenguaje de salida es un DSL muy restringido; no genera Python estandar ni codigo de proposito general.
- No se documentan sesgos especificos, pero al entrenarse con datos generados por reglas, la distribucion de peticiones esta acotada y puede no cubrir variaciones linguisticas.
- Riesgo de alucinacion en el sentido de generar programas sintacticamente validos pero que no representan la peticion; el interprete limita pasos y esperas, pero no garantiza correccion semantica.
- No se especifican limitaciones de contexto ni idiomas adicionales al ingles; la model card no publica la longitud de contexto.
- Licencia MIT permite uso comercial, pero el firmware y el runtime dependen del repositorio fork de slvDev/esp32-ai; conviene revisar las licencias de los componentes heredados.
- El modelo esta pensado para hardware concreto (ESP32-S3, 16 MB flash, 8 MB PSRAM, OLED SSD1306 en GPIO 18/8); otro cableado o pantalla requiere recompilar el firmware.
- No hay datos publicados sobre robustez frente a entradas adversarias ni sobre comportamiento en produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/Unt1l1f1nd/esp32-tiny-coding-model
- Repositorio del proyecto: https://github.com/moudrkat/esp32-ai
- Repositorio original (fork base): https://github.com/slvDev/esp32-ai
- Generador de datos de entrenamiento: `research/oled/gen.py` en el repositorio
- Script de terminal serie: `scripts/oled_talk.py` en el repositorio
- Script de compilacion de firmware: `scripts/deploy.sh oled` en el repositorio
