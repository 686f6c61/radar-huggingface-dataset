# Vishwasaidev/quill

## Resumen

Quill es un modelo de generacion de imagen texto-a-imagen especializado en caligrafia, desarrollado por Vishwasaidev. Su particularidad es que no ha sido entrenado: no hay red neuronal ni descenso de gradiente. El repositorio contiene 2.506.381 numeros almacenados en `weights.safetensors` (9,8 MB) que codifican trayectorias de trazos de glifos, colores de tinta, una matriz de suavizado Chaikin y ajustes de pluma en los metadatos. La generacion se realiza con NumPy y Pillow, sin frameworks de aprendizaje profundo.

El modelo escribe en seis manos caligraficas: italica, foundational, blackletter, copperplate y brush para alfabeto latino, y shodo (caligrafia japonesa a pincel) para kanji y kana. Los trazos latinos proceden de las fuentes Hershey (dominio publico, 1967) y los de kanji de KanjiVG (6.703 caracteres, CC BY-SA 3.0). La caligrafia emerge de plumas configuradas a mano: pluma ancha de borde plano, punta flexible, pincel redondo y pincel shodo con perfiles de presion por tipo de trazo.

Es relevante como caso limite y herramienta de interpretabilidad: demuestra que se puede obtener un renderizado caligrafico controlable y determinista sin entrenamiento, util para docencia, generacion de manuscritos decorativos y estudio de la relacion entre trayectoria, pluma y rasterizacion. No es un modelo de lenguaje ni un generador difuso; es un motor procedural con pesos serializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor procedural determinista (sin red neuronal): trayectorias de trazo, suavizado Chaikin, transformacion de inclinacion, geometria de pluma, rasterizacion por bordes y composicion de tinta |
| Parametros totales | 2.506.381 numeros en `weights.safetensors` (9,8 MB); no son parametros entrenados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); el texto de entrada se procesa por lineas con ajuste a `--width` |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | Latin ASCII (Hershey); japones limitado a los 6.703 kanji y kana de KanjiVG; sin griego, cirilico ni devanagari |
| Licencia | cc-by-sa-3.0 (los datos de kanji derivados de KanjiVG quedan bajo la misma licencia) |
| Formato de pesos | safetensors (`weights.safetensors`), generado con `export_weights.py` |

## Arquitectura y entrenamiento

No hay entrenamiento. El pipeline tiene cinco capas descritas por el autor. Primero, los glifos: cada caracter es una lista ordenada de trazos y cada trazo una lista de puntos por los que pasa la pluma; los trazos de kanji llevan ademas su tipo (stop, dot, left sweep, right sweep, hook, rise). Segundo, suavizado mediante Chaikin con mezcla fija 3/4 : 1/4 entre puntos vecinos, codificado en una matriz 2x2 (`smooth.chaikin`). Tercero, inclinacion y compresion por estilo (`slant`, `squeeze`). Cuarto, la pluma: cada paso genera una forma convexa (casco convexo del nib en dos puntos consecutivos para pluma ancha; perfil de presion para punta, pincel y shodo). Quinto, rasterizacion: por pixel se evalua `d - nx*x - ny*y` por cada borde de forma, minimo sobre los bordes de una forma (AND) y maximo entre formas (OR), con rampa de un pixel para antialiasing y patron sinusoidal fijo para las zonas de pincel seco. La tinta se compone sobre textura de papel, con capas separadas para la inicial roja y el sello.

Los datos de entrenamiento no existen; los datos de partida son las trayectorias de Hershey (extraidas del paquete `Hershey-Fonts`, licencia MIT) y de KanjiVG. No hay RLHF, DPO ni ajuste alguno. La innovacion tecnica es la interpretabilidad total: cada decision de renderizado es inspeccionable y determinista, y el modelo es reproducible bit a bit dados los mismos pesos y parametros.

## Capacidades

- Generacion de texto caligrafico en seis estilos: `italic`, `foundational`, `blackletter`, `copperplate`, `brush` y `shodo` (seleccion automatica para kanji o kana).
- Seleccion de tinta entre nueve opciones: `iron`, `black`, `sepia`, `sumi`, `red`, `blue`, `green`, `gold`, `vermilion`.
- Control de tamano mediante `--size` (altura de mayuscula en pixeles; en shodo la celda es 1,8 veces ese valor) y de ancho de linea con `--width`.
- Inicial rubricada con `--initial`: la primera letra se dibuja al doble de tamano en rojo, como en un manuscrito.
- Sellos con `--seal`: hasta 4 caracteres (kanji o latinos) grabados en un sello rojo con letras blancas, bordes irregulares y tinta desigual.
- Animacion con `--animate`: WebP animado de la pagina escribiendose en orden de trazos.
- Flourish con `--flourish`: remate ahusado bajo el texto latino.
- Salto de columna en shodo al cambiar de linea o tras 6 caracteres.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni comprension; no es un modelo de lenguaje.

## Casos de uso

- Generacion de manuscritos decorativos para portadas, diplomas y certificados: con `--initial` y `--seal` se produce una pagina rubricada con sello personalizado, adecuada para impresion por su salida de alta resolucion controlada por `--size`.
- Material didactico de caligrafia y shodo: `--animate` genera la secuencia de escritura trazo a trazo en orden correcto, util para demostraciones en aula o tutoriales interactivos.
- Estudio de interpretabilidad de sistemas generativos: al no haber red neuronal, cada pixel es trazable a una trayectoria, una pluma y una regla de rasterizacion, lo que permite analizar como la geometria produce el resultado final.
- Generacion de sellos y marcas personales: `--seal` produce sellos rojos con caracteres kanji o latinos, reutilizables en documentos, arte digital o merchandising.
- Prototipado rapido de tipografia caligrafica en proyectos de diseno: comparar seis manos con nueve tintas sobre el mismo texto permite iterar estilos antes de encargar una fuente real.
- Integracion en aplicaciones web ligeras: el modelo corre en Pyodide en el navegador (Space de Hugging Face) y solo requiere NumPy y Pillow, por lo que puede embeberse en demos educativas sin infraestructura de GPU.
- Generacion de ilustraciones de caligrafia japonesa para contenido editorial: con shodo y tinta `sumi` se obtienen caracteres con perfiles de presion realistas (tome, harai, ganchos) para articulos sobre cultura japonesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta tiempos de ejecucion en CPU: unos segundos por imagen y hasta unos 10 segundos para una hoja de demostracion o una animacion, porque cada paso de pluma se rasteriza por separado.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU ni aceleracion por hardware.
- CPU: cualquier CPU moderna; el cuello de botella es la rasterizacion por paso de pluma.
- Memoria RAM: minima; los pesos ocupan 9,8 MB y las dependencias son NumPy y Pillow.
- GPU recomendadas: ninguna; no se documenta soporte CUDA ni Metal.
- Cabe en cualquier equipo, incluidos dispositivos de bajos recursos y navegador via Pyodide.
- Despliegue: servidor local con `python server.py` (http://127.0.0.1:8792), CLI con `python quill.py`, o Space de Hugging Face en el navegador.
- Latencia estimada: segundos por imagen en CPU; hasta ~10 s para hojas de demostracion o animaciones.
- Throughput: no disponible; no esta pensado para generacion por lotes de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Quill | Motor procedural de caligrafia | 2.506.381 numeros (9,8 MB) | no aplica | ninguno | cc-by-sa-3.0 | Hugging Face, Space, app web |
| Modelos de difusion texto-a-imagen (p. ej. Stable Diffusion) | Red neuronal generativa | cientos de millones a miles de millones | limitado por prompt | si, a gran escala | varian (a menudo CreativeML o similar) | amplia |
| Fuentes caligraficas vectoriales (p. ej. Hershey) | Datos de glifos | no aplica | no aplica | ninguno | dominio publico | paquetes y repositorios |
| KanjiVG | Datos de trazos de kanji | no aplica | no aplica | ninguno | CC BY-SA 3.0 | web y repositorios |

La comparacion con modelos de difusion no es directa: Quill no genera imagenes arbitrarias ni interpreta prompts, solo renderiza texto con estilos caligraficos predefinidos. Frente a fuentes vectoriales, aporta plumas, tintas, sellos y animacion, pero carece de la flexibilidad tipografica de una fuente completa.

## Limitaciones y advertencias

- Las formas de las letras son prestadas: proceden de Hershey y KanjiVG; no hay aprendizaje, pero tampoco originalidad tipografica.
- Las letras de Hershey son una fuente tecnica, no una mano de caligrafo: la italica es una romana inclinada con pluma italica, no una italica verdadera con arcos ramificados; la blackletter usa letras goticas dibujadas con varios trazos paralelos y a tamanos grandes muestran huecos finos que parecen grabado.
- Shodo limitado a escritura regular (kaisho): no hay cursiva (gyosho o sosho), los trazos no se enlazan y cada copia de un caracter es identica.
- Cobertura de caracteres restringida: latin ASCII y los 6.703 caracteres de KanjiVG; sin griego, cirilico ni devanagari, y sin puntuacion japonesa como 。
- Licencia CC BY-SA 3.0: el uso comercial obliga a compartir bajo la misma licencia las obras derivadas y a atribuir; la parte de kanji derivada de KanjiVG queda sujeta a esa misma licencia.
- Rendimiento lento en CPU: cada paso de pluma se rasteriza por separado, con segundos por imagen y hasta ~10 s para hojas o animaciones.
- No es un modelo de lenguaje: no hay comprension, razonamiento, tool calling ni generacion de texto libre; solo renderiza la cadena de entrada.
- Riesgo de alucinacion no aplica en el sentido habitual, pero los caracteres ausentes de los datos se omiten silenciosamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishwasaidev/quill
- Space (Pyodide, en navegador): https://huggingface.co/spaces/Vishwasaidev/quill
- Aplicacion web: https://quill-calligraphy-b25f17930c4d.herokuapp.com/
- KanjiVG: http://kanjivg.tagaini.net
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Paquete Hershey-Fonts (MIT): no disponible como enlace directo en la informacion proporcionada
